import asyncpg
from app.config import settings

pool = None

async def init_db():
    global pool
    try:
        # statement_cache_size=0 ensures 100% compatibility with Supabase pooler
        pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL,
            min_size=2,
            max_size=10,
            statement_cache_size=0
        )
        print("Database connection pool created successfully.")
    except Exception as e:
        import traceback
        print("Failed to create database connection pool:")
        traceback.print_exc()
        pool = None

async def close_db():
    global pool
    if pool:
        await pool.close()

async def get_db_connection():
    if not pool:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Database connection pool is not available.")
    async with pool.acquire() as conn:
        yield conn