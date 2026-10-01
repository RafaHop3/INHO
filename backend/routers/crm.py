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

    model_config = {"from_attributes": True}


@router.get("/contacts/", response_model=List[CRMContactOut])
async def list_contacts(limit: int = 100):
    # Stub contacts – uses CRMContactOut instances to guarantee correct serialization in AWS Lambda
    now = datetime.now(timezone.utc)
    return [
        CRMContactOut(
            id=uuid.uuid4(),
            business_id=uuid.uuid4(),
            created_at=now,
            updated_at=now,
            category="EMPLOYEE",
            name="Juliana",
            phone="5551984743957",
            email="juliana@orbesystems.com.br",
        ),
        CRMContactOut(
            id=uuid.uuid4(),
            business_id=uuid.uuid4(),
            created_at=now,
            updated_at=now,
            category="ADMIN",
            name="Rafael",
            phone="5551984743957",
            email="rafael@orbesystems.com.br",
        ),
        CRMContactOut(
            id=uuid.uuid4(),
            business_id=uuid.uuid4(),
            created_at=now,
            updated_at=now,
            category="CLIENT",
            name="Maria Souza",
            phone="5551999999999",
            email=None,
        ),
        CRMContactOut(
            id=uuid.uuid4(),
            business_id=uuid.uuid4(),
            created_at=now,
            updated_at=now,
            category="CLIENT",
            name="Carlos Beta",
            phone="5511888888888",
            email=None,
        ),
    ]


class OmnichannelDirectMessage(BaseModel):
    phone: str
    email: Optional[str] = None
    subject: Optional[str] = "Orbe Systems - Nova Mensagem"
    message: str


@router.post("/whatsapp/send")
async def proxy_omnichannel_message(payload: OmnichannelDirectMessage):
    # Mock success response
    return {
        "status": "success",
        "whatsapp_delivery_code": [f"{payload.phone}:200"],
        "email_delivery_code": "Ignorado",
    }
