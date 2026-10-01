"""
Test the full contacts endpoint with a realistic mock of what AWS Lambda does.
"""
import sys
import os

# Simulate Lambda environment
os.environ['DATABASE_URL'] = 'postgresql+asyncpg://user:pass@localhost/test'
os.environ['SECRET_KEY'] = 'test_secret'
os.environ['FRONTEND_URL'] = 'https://inho.orbesystems.com.br'
os.environ['APP_ENV'] = 'production'

# Test by importing the crm router and hitting the endpoint directly
import asyncio

async def main():
    from routers.crm import list_contacts
    try:
        result = await list_contacts(limit=100)
        print("SUCCESS - list_contacts returned:", type(result))
        print("First item:", result[0])
        
        # Test JSON serialization like FastAPI would
        import json
        from pydantic import BaseModel
        serialized = [r.model_dump(mode='json') for r in result]
        print("JSON serialization OK, first contact:", json.dumps(serialized[0], indent=2))
    except Exception as e:
        import traceback
        print("ERROR:", e)
        traceback.print_exc()

asyncio.run(main())
