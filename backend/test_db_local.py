import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://orbe_admin:orbe_password@52.20.22.241:5432/orbesystems"

async def test_conn():
    try:
        engine = create_async_engine(DATABASE_URL, echo=False)
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT 1"))
            print("Connected successfully! Result:", res.scalar())
    except Exception as e:
        print("Database Connection Error:", e)

asyncio.run(test_conn())
