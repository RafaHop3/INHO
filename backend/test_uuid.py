from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional, List
import uuid
from fastapi.testclient import TestClient

app = FastAPI()

class CRMContactOut(BaseModel):
    id: UUID
    business_id: UUID
    created_at: datetime
    updated_at: datetime
    category: str
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

@app.get("/contacts/", response_model=List[CRMContactOut])
async def list_contacts(limit: int = 100):
    return [
        {
            "id": uuid.uuid4(),
            "business_id": uuid.uuid4(),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "category": "EMPLOYEE",
            "name": "Juliana",
            "phone": "5551984743957",
            "email": "juliana@orbesystems.com.br"
        }
    ]

client = TestClient(app)
response = client.get("/contacts/")
print("Status Code:", response.status_code)
if response.status_code != 200:
    print("Response:", response.json())
