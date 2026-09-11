import asyncpg
from app.config import settings

pool = None

async def init_db():
    global pool
    # statement_cache_size=0 ensures 100% compatibility with Supabase pooler
    pool = await asyncpg.create_pool(
        dsn=settings.DATABASE_URL,
        min_size=2,
        max_size=10,
        statement_cache_size=0
    )

async def close_db():
    global pool
    if pool:
        await pool.close()

async def get_db_connection():
    async with pool.acquire() as conn:
        yield conn