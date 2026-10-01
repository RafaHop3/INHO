from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional, List, Annotated
import uuid
import httpx

from core.deps import get_current_user
from models.models import User

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
async def proxy_omnichannel_message(
    payload: OmnichannelDirectMessage,
    current_user: Annotated[User, Depends(get_current_user)]
):
    # Prefix message securely on backend
    formatted_message = f"Orbrick>Inho>{current_user.full_name} = {payload.message}"
    
    # Send to Baileys proxy on EC2 port 3001
    baileys_url = "http://52.20.22.241:3001/send"
    baileys_payload = {
        "phone": payload.phone,
        "message": formatted_message
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(baileys_url, json=baileys_payload, timeout=15.0)
            resp.raise_for_status()
            return {"status": "success", "baileys_response": resp.json()}
        except Exception as e:
            return {"status": "error", "detail": str(e)}
