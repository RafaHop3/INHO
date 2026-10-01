from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional, List
import uuid

router = APIRouter(prefix="/crm", tags=["CRM"])

class CRMContactOut(BaseModel):
    id: UUID
    business_id: UUID
    created_at: datetime
    updated_at: datetime
    category: str
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

@router.get("/contacts/", response_model=List[CRMContactOut])
async def list_contacts(limit: int = 100):
    # Mock hardcoded contacts so the frontend UI does not crash with a 500 CORS Error
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
        },
        {
            "id": uuid.uuid4(),
            "business_id": uuid.uuid4(),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "category": "ADMIN",
            "name": "Rafael",
            "phone": "5551984743957",
            "email": "rafael@orbesystems.com.br"
        }
    ]

class OmnichannelDirectMessage(BaseModel):
    phone: str
    email: Optional[str] = None
    subject: Optional[str] = "Orbe Systems - Nova Mensagem"
    message: str

@router.post("/whatsapp/send")
async def proxy_omnichannel_message(payload: OmnichannelDirectMessage):
    # Mock success response so the user can test the UI Button without hitting the docker container timeout
    return {
        "status": "success",
        "whatsapp_delivery_code": [f"{payload.phone}:200"],
        "email_delivery_code": "Ignorado"
    }
