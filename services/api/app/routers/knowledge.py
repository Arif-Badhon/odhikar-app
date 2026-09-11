from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.database import get_db_connection

router = APIRouter(prefix="/knowledge", tags=["Legal Knowledge Repository"])

@router.get("/articles")
async def list_articles(category: Optional[str] = None, conn = Depends(get_db_connection)):
    query = "SELECT id, slug, category, title_bn, title_en, summary_bn, summary_en FROM knowledge_articles WHERE status = 'PUBLISHED'"
    params = []
    if category:
        query += " AND category = $1"
        params.append(category)
    query += " ORDER BY created_at DESC"
    rows = await conn.fetch(query, *params)
    return [dict(r) for r in rows]

@router.get("/articles/{slug}")
async def get_article_detail(slug: str, conn = Depends(get_db_connection)):
    article = await conn.fetchrow(
        "SELECT * FROM knowledge_articles WHERE slug = $1 AND status = 'PUBLISHED'", slug
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    sources = await conn.fetch(
        """
        SELECT s.source_title, s.issuing_authority, s.act_name, s.act_year, s.section_reference, s.official_url
        FROM knowledge_sources s
        JOIN article_source_mappings m ON s.id = m.source_id
        WHERE m.article_id = $1
        """,
        article["id"]
    )
    res = dict(article)
    res["sources"] = [dict(s) for s in sources]
    return res