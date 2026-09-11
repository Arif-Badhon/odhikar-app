from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db_connection

router = APIRouter(prefix="/cases", tags=["Paralegal Case Workspace"])

@router.get("/queue")
async def get_case_queue(status: Optional[str] = None, conn = Depends(get_db_connection)):
    query = """
        SELECT id, case_number, primary_category, urgency, status, classification_confidence, created_at
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
    row = await conn.fetchrow("SELECT * FROM cases WHERE id = $1", case_id)
    if not row:
        raise HTTPException(status_code=404, detail="Case not found")
    return dict(row)

class UpdateStatusRequest(BaseModel):
    status: str

@router.patch("/{case_id}/status")
async def update_case_status(case_id: str, req: UpdateStatusRequest, conn = Depends(get_db_connection)):
    await conn.execute("UPDATE cases SET status = $1, updated_at = NOW() WHERE id = $2", req.status, case_id)
    return {"status": "SUCCESS"}