from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import random

from app.services.gemini import gemini_client
from app.services.safety import check_safety_rules
from app.database import get_db_connection

router = APIRouter(prefix="/intake", tags=["Client Victim Intake"])

class AudioIntakeRequest(BaseModel):
    audio_base64: str
    mime_type: str = "audio/webm"

class AnalysisRequest(BaseModel):
    narrative: str

class FollowUpRequest(BaseModel):
    narrative: str
    current_facts: Dict[str, Any]
    missing_fields: List[str]
    answer: str

@router.post("/transcribe")
async def transcribe_voice(request: Request):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    raw_audio = body.get("audio_base64")
    mime_type = body.get("mime_type", "audio/webm")

    if not raw_audio:
        raise HTTPException(status_code=400, detail="Missing 'audio_base64' in payload")

    if isinstance(raw_audio, list):
        clean_audio = raw_audio[-1] if len(raw_audio) > 1 else raw_audio[0]
    else:
        clean_audio = str(raw_audio)

    if "," in clean_audio:
        clean_audio = clean_audio.split(",")[-1]

    clean_audio = clean_audio.strip()

    try:
        transcript = await gemini_client.transcribe_audio(clean_audio, mime_type)
        return {"transcript": transcript}
    except Exception as e:
        error_detail = f"{type(e).__name__}: {str(e)}"
        print(f"[TRANSCRIBE ERROR] {error_detail}")
        raise HTTPException(status_code=500, detail=f"Gemini transcription error: {error_detail}")

@router.post("/analyze")
async def analyze_narrative(req: AnalysisRequest):
    # 1. Deterministic safety check fallback
    safety = check_safety_rules(req.narrative)
    
    # 2. Extract facts via Gemini
    system_prompt = """
    You are the Odhikar Bangladesh Legal AI Analyst.
    Analyze the Bangla legal narrative. Categorize strictly into one of:
    ['DOWER_MAINTENANCE', 'DOWRY', 'LAND_INHERITANCE', 'UNPAID_WAGES', 'OUT_OF_SCOPE'].
    Extract structured information:
    - parties (applicants, respondents)
    - dates and chronology
    - amounts (dower, dowry, wage rates, arrears)
    - harm and current situation
    - missing_fields: list of missing key facts needed for legal action
    - confidence: float between 0.0 and 1.0
    Output ONLY valid JSON.
    """
    prompt = f"Client Narrative: {req.narrative}"
    try:
        response_text = await gemini_client.generate_text(prompt, system_prompt)
        cleaned_json = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_json)
    except Exception:
        # Graceful fallback
        data = {
            "primary_category": "OUT_OF_SCOPE",
            "confidence": 0.5,
            "parties": {},
            "amounts": {},
            "missing_fields": ["ঘটনার বিস্তারিত বিবরণ", "প্রতিপক্ষের নাম", "তারিখ"],
            "harm": req.narrative
        }

    urgency = "URGENT_SAFETY" if safety["is_urgent"] else "NORMAL"
    
    return {
        "safety": safety,
        "urgency": urgency,
        "analysis": data
    }

class SaveCaseRequest(BaseModel):
    transcript: str
    analysis: Dict[str, Any]
    urgency: str
    clinic_info: Optional[Dict[str, Any]] = None
    appointment_info: Optional[Dict[str, Any]] = None

@router.post("/confirm")
async def confirm_and_create_case(req: SaveCaseRequest, conn = Depends(get_db_connection)):
    case_num = f"ODH-{random.randint(100000, 999999)}"
    cat = req.analysis.get("primary_category", "OUT_OF_SCOPE")
    if cat not in ['DOWER_MAINTENANCE', 'DOWRY', 'LAND_INHERITANCE', 'UNPAID_WAGES', 'OUT_OF_SCOPE']:
        cat = 'OUT_OF_SCOPE'
        
    row = await conn.fetchrow(
        """
        INSERT INTO cases (
            case_number, primary_category, urgency, classification_confidence,
            applicant_info, respondent_info, amounts, harm_description,
            gaps, original_transcript, clinic_referral_info, appointment_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, case_number
        """,
        case_num,
        cat,
        req.urgency,
        float(req.analysis.get("confidence", 0.8)),
        json.dumps(req.analysis.get("parties", {}).get("applicants", {})),
        json.dumps(req.analysis.get("parties", {}).get("respondents", {})),
        json.dumps(req.analysis.get("amounts", {})),
        req.analysis.get("harm", req.transcript),
        req.analysis.get("missing_fields", []),
        req.transcript,
        json.dumps(req.clinic_info or {}),
        json.dumps(req.appointment_info or {})
    )
    return {"status": "SUCCESS", "case_id": str(row["id"]), "case_number": row["case_number"]}