from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import json
from app.database import get_db_connection
from app.services.gemini import gemini_client

router = APIRouter(prefix="/training", tags=["AI Simulation Training Lab"])

@router.get("/personas")
async def get_personas(conn = Depends(get_db_connection)):
    rows = await conn.fetch("SELECT id, code, title_bn, title_en, category, difficulty, public_intro_bn FROM training_personas")
    return [dict(r) for r in rows]

class ChatTurnRequest(BaseModel):
    persona_id: str
    messages: List[Dict[str, str]] # {"role": "user"|"assistant", "content": "..."}

@router.post("/chat")
async def simulate_persona_turn(req: ChatTurnRequest, conn = Depends(get_db_connection)):
    persona = await conn.fetchrow("SELECT * FROM training_personas WHERE id = $1", req.persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    
    system_instruction = f"""
    You are roleplaying as a synthetic client in Bangladesh seeking legal aid.
    Title: {persona['title_bn']}
    Communication style: {persona['communication_style']}
    Hidden ground truth: {persona['hidden_ground_truth']}
    Safety triggers: {persona['safety_trigger_condition']}

    RULES:
    1. Respond in natural Bangla.
    2. Reveal facts ONLY when specifically asked by the paralegal. Do not give away all hidden information at once.
    3. Stay in character. If the trainee asks a good question, reveal the corresponding fact. If they are aggressive or unclear, express confusion or emotion.
    """
    history_str = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in req.messages])
    prompt = f"Conversation History:\n{history_str}\n\nClient (Your turn):"
    
    reply = await gemini_client.generate_text(prompt, system_instruction)
    return {"reply": reply}

class EvaluationRequest(BaseModel):
    persona_id: str
    messages: List[Dict[str, str]]

@router.post("/evaluate")
async def evaluate_training_session(req: EvaluationRequest, conn = Depends(get_db_connection)):
    eval_prompt = f"""
    Evaluate the following paralegal interview transcript according to the 8 Odhikar competency dimensions:
    1. Client rapport and consent (10)
    2. Issue spotting and legal relevance (15)
    3. Fact elicitation and chronology (20)
    4. Evidence and document identification (10)
    5. Safety and urgency screening (15)
    6. Scope boundaries (10)
    7. Ethics and non-judgmental neutrality (10)
    8. Summarization and closing (10)

    Critical Fail Check: If violence or urgent safety was disclosed and ignored, set critical_fail=true.
    Output JSON format:
    {{
      "overall_score": 82,
      "dimension_scores": {{...}},
      "critical_fail": false,
      "strengths": ["..."],
      "missed_questions": ["..."],
      "suggestions": ["..."]
    }}
    Transcript:
    {json.dumps(req.messages, ensure_ascii=False)}
    """
    res = await gemini_client.generate_text(eval_prompt)
    clean_json = res.replace("```json", "").replace("```", "").strip()
    return json.loads(clean_json)