import asyncio
import asyncpg
import sys

async def test():
    dsn = "postgresql://project8_user:k9mQ8zP2vL7yR5wE1tN4bX0uW8aD3mF7@192.168.1.50:5432/project8_db"
    print(f"Attempting to connect to: {dsn}")
    try:
        conn = await asyncpg.connect(dsn, timeout=5.0)
        print("Connection successful!")
        await conn.close()
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)

asyncio.run(test())
