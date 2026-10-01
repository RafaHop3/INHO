import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from core.config import settings
from sqlalchemy import text

async def main():
    print(f"Connecting to {settings.DATABASE_URL}")
    try:
        engine = create_async_engine(settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"))
        async with engine.connect() as conn:
            print("Connected!")
            
            # Get tables
            tables_result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
            tables = [t[0] for t in tables_result]
            print(f"Tables: {tables}")
            
            # Find Rafael's ID and Business
            users = await conn.execute(text("SELECT id, name, email FROM users WHERE email='rafael@orbesystems.com.br'"))
            user = users.fetchone()
            print(f"User rafael@orbesystems.com.br: {user}")
            
            # Search for Juliana in CRM contacts or similar
            if 'crm_contacts' in tables:
                contacts = await conn.execute(text("SELECT * FROM crm_contacts WHERE name ILIKE '%Juliana%'"))
                res = contacts.fetchall()
                print(f"Juliana in crm_contacts: {res}")
                
            if 'cooperados' in tables:
                coops = await conn.execute(text("SELECT razao_social, nome_fantasia, telefone, email FROM cooperados WHERE razao_social ILIKE '%Juliana%' OR nome_fantasia ILIKE '%Juliana%'"))
                res = coops.fetchall()
                print(f"Juliana in cooperados: {res}")
            
            # General search across arbitrary tables
            # if we have specifically a whatsapp connection
            if 'whatsapp_instances' in tables:
                wa = await conn.execute(text("SELECT * FROM whatsapp_instances"))
                print(f"whatsapp_instances: {wa.fetchall()}")
                
    except Exception as e:
        print(f"Error connecting: {e}")

asyncio.run(main())
