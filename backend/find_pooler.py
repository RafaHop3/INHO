import asyncio
import asyncpg

HOSTS = [
    "aws-0-us-east-1.pooler.supabase.com",
    "aws-0-us-east-2.pooler.supabase.com",
    "aws-0-us-west-1.pooler.supabase.com",
    "aws-0-us-west-2.pooler.supabase.com",
    "aws-0-sa-east-1.pooler.supabase.com",
]

async def try_connect(host):
    try:
        conn = await asyncpg.connect(
            user='postgres.bjidrhoniciczqkhazqv',
            password='Muhammadalivsroyjonesjr#Ju.130798',
            host=host,
            port=6543,
            database='postgres',
            timeout=3
        )
        print(f"SUCCESS on {host}!")
        await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);")
        print("Successfully added whatsapp column to users table using pooler.")
        await conn.close()
        return True
    except Exception as e:
        print(f"Failed on {host}: {e}")
        return False

async def main():
    for h in HOSTS:
        ok = await try_connect(h)
        if ok:
            with open(".env", "r") as f:
                content = f.read()
            # Replace the old pooler or direct string with the working one
            import re
            new_content = re.sub(
                r'DATABASE_URL=.*',
                f'DATABASE_URL=postgresql+asyncpg://postgres.bjidrhoniciczqkhazqv:Muhammadalivsroyjonesjr%23Ju.130798@{h}:6543/postgres',
                content
            )
            with open(".env", "w") as f:
                f.write(new_content)
            print("Successfully updated .env DATABASE_URL.")
            break

if __name__ == "__main__":
    asyncio.run(main())
