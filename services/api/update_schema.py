import asyncio
import asyncpg
import sys
from app.config import settings

async def update_schema():
    print(f"Connecting to database...")
    try:
        conn = await asyncpg.connect(settings.DATABASE_URL)
        print("Connected! Updating cases table schema...")
        
        # Add new columns if they don't exist
        queries = [
            "ALTER TABLE cases ADD COLUMN IF NOT EXISTS structured_record JSONB;",
            "ALTER TABLE cases ADD COLUMN IF NOT EXISTS missing_fields JSONB;",
            "ALTER TABLE cases ADD COLUMN IF NOT EXISTS audio_path TEXT;"
        ]
        
        for q in queries:
            print(f"Running: {q}")
            await conn.execute(q)
            
        print("Schema updated successfully!")
        await conn.close()
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(update_schema())
