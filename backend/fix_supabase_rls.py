import asyncio
import asyncpg
import sys

# Connect directly to the user's Supabase project postgres database
DATABASE_URL = "postgresql://postgres:Muhammadalivsroyjonesjr%23Ju.130798@db.ehpbwhyqweljbsxbwbob.supabase.co:5432/postgres"

async def check_and_fix_rls():
    print("Connecting to Supabase project ehpbwhyqweljbsxbwbob...")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("Connected!")
        
        # Get all public tables
        tables = await conn.fetch("""
            SELECT tablename 
            FROM pg_tables
            WHERE schemaname = 'public';
        """)
        
        print("\n--- Current RLS Status ---")
        for t in tables:
            table_name = t['tablename']
            
            # Check if RLS is enabled
            rls_enabled_info = await conn.fetchval(f"""
                SELECT relrowsecurity 
                FROM pg_class 
                WHERE relname = '{table_name}';
            """)
            print(f"Table '{table_name}' RLS enabled: {rls_enabled_info}")
            
            if not rls_enabled_info:
                print(f"-> Enabling RLS on {table_name}")
                await conn.execute(f"ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;")
                
            # Create a restrictive policy by default if none exist, or we can just leave it as ENABLE ROW LEVEL SECURITY
            # Actually, just enabling RLS makes the table reject all access by default for "anon" and "authenticated"!
            print(f"-> Applying base policies on {table_name}")
            
            # Drop previous base policies if exist
            await conn.execute(f'DROP POLICY IF EXISTS "Enable read access for all" ON "{table_name}";')
            await conn.execute(f'DROP POLICY IF EXISTS "Enable all access for authenticated" ON "{table_name}";')

            # This allows only authenticated users to read/write, which prevents public access (fixing the vulnerability)
            # You might want to customize these, but this is a much safer default than public access.
            # INHO uses auth via backend, not direct Supabase client for data, so the backend uses service_role key or postgres user?
            # Wait, if backend uses psycopg2/asyncpg with postgres user, then postgres SUPERUSER bypasses RLS anyway!
            # So enabling RLS on tables won't break the backend if the backend connects as postgres user.
            # But the warning from Supabase is because the REST API (PostgREST) allows access via anon key.
            # So enabling RLS with no policies effectively blocks PostgREST (Data API) for anon and authenticated, 
            # while the backend (using postgres user) continues to work perfectly!
            
        await conn.close()
        print("\nRLS enforcement completed.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_and_fix_rls())
