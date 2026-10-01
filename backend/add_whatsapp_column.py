import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:Muhammadalivsroyjonesjr%23Ju.130798@db.bjidrhoniciczqkhazqv.supabase.co:5432/postgres"

engine = create_async_engine(DATABASE_URL)

async def main():
    try:
        async with engine.begin() as conn:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);"))
            print("Successfully added whatsapp column to users table.")
    except Exception as e:
        print("Error:", e)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
