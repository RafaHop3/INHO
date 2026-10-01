import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres.bjidrhoniciczqkhazqv:Muhammadalivsroyjonesjr%23Ju.130798@aws-1-us-west-2.pooler.supabase.com:6543/postgres')
    try:
        await conn.execute("UPDATE inho.users SET role = 'SUPER_ADMIN' WHERE email = 'rafael@orbesystems.com.br'")
        res = await conn.fetch("SELECT email, role FROM inho.users WHERE email = 'rafael@orbesystems.com.br'")
        print(res)
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
