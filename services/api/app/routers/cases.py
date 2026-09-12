import os
import uuid
import base64
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Any
from app.database import get_db_connection

router = APIRouter(prefix="/cases", tags=["Paralegal Case Workspace"])

@router.get("/queue")
async def get_case_queue(status: Optional[str] = None, conn = Depends(get_db_connection)):
    query = """
        SELECT id, case_number, primary_category, urgency, status, classification_confidence, created_at, structured_record, audio_path
        FROM cases
    """
    params = []
    if status and status != "ALL":
        query += " WHERE status = $1"
        params.append(status)
    query += " ORDER BY CASE WHEN urgency = 'URGENT_SAFETY' THEN 0 WHEN urgency = 'TIME_SENSITIVE' THEN 1 ELSE 2 END, created_at DESC"
    
    rows = await conn.fetch(query, *params)
    return [dict(r) for r in rows]

@router.get("/{case_id}")
async def get_case_detail(case_id: str, conn = Depends(get_db_connection)):
    row = await conn.fetchrow("SELECT * FROM cases WHERE case_number = $1", case_id)
    if not row:
        raise HTTPException(status_code=404, detail="Case not found")
    return dict(row)

class UpdateStatusRequest(BaseModel):
    status: str

@router.patch("/{case_id}/status")
async def update_case_status(case_id: str, req: UpdateStatusRequest, conn = Depends(get_db_connection)):
    await conn.execute("UPDATE cases SET status = $1, updated_at = NOW() WHERE case_number = $2", req.status, case_id)
    return {"status": "SUCCESS"}

@router.post("/submit")
async def submit_case(request: Request, conn = Depends(get_db_connection)):
    data = await request.json()
    record = data.get("record", {})
    case_number = record.get("id")
    if not case_number:
        raise HTTPException(status_code=400, detail="Missing case_number (id)")

    audio_path = None
    audio_data_url = record.get("audioDataUrl")
    if audio_data_url and audio_data_url.startswith("data:audio/"):
        try:
            header, encoded = audio_data_url.split(",", 1)
            audio_bytes = base64.b64decode(encoded)
            file_name = f"intake-{uuid.uuid4().hex}.webm"
            audio_path = f"uploads/{file_name}"
            with open(audio_path, "wb") as f:
                f.write(audio_bytes)
        except Exception as e:
            print(f"Failed to save audio: {e}")
            audio_path = None

    import json
    # Sanitize record for JSONB storage
    safe_record = record.copy()
    safe_record.pop("audioDataUrl", None)
    
    classification = record.get("classification", {})

    query = """
    INSERT INTO cases (
        case_number, status, urgency, primary_category, 
        confidence, safety_flag, transcript_bn, audio_path, 
        structured_record, missing_fields
    ) VALUES (
        $1, $2, $3, $4, 
        $5, $6, $7, $8, 
        $9::jsonb, $10::jsonb
    )
    ON CONFLICT (case_number) DO UPDATE SET
        status = EXCLUDED.status,
        urgency = EXCLUDED.urgency,
        primary_category = EXCLUDED.primary_category,
        structured_record = EXCLUDED.structured_record,
        missing_fields = EXCLUDED.missing_fields,
        audio_path = COALESCE(EXCLUDED.audio_path, cases.audio_path)
    """
    
    await conn.execute(
        query,
        case_number,
        record.get("status", "pending"),
        record.get("urgency", "NORMAL"),
        classification.get("primary", "UNKNOWN"),
        classification.get("confidence", 0.0),
        record.get("safetyFlag", False),
        record.get("transcriptBn", "")[:12000],
        audio_path,
        json.dumps(safe_record),
        json.dumps(record.get("missing", []))
    )
    return {"ok": True, "caseNumber": case_number}