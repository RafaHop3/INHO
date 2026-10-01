from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import List
import uuid
import bcrypt
from datetime import datetime, timezone

from db.session import get_db, engine, Base
from models.models import User, PDVSale, AuditLog
from core.deps import require_super_admin
from schemas.admin_schemas import (
    GlobalStatsOut, UserListOut, UserRoleUpdate, UserStatusUpdate, AuditLogOut
)

router = APIRouter()

@router.get("/seed")
async def run_lambda_seed(db: AsyncSession = Depends(get_db)):
    try:
        # Patch schema drifts against the true AWS VPC PostgreSQL target
        # Use full SQL to prevent Postgres caching and silently ignoring columns
        await db.execute(text("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);"))
        await db.execute(text("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);"))
        await db.execute(text("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);"))
        await db.execute(text("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"))
        await db.execute(text("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;"))
        await db.execute(text("ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();"))
        await db.commit()
        
        # Hard purge existing collision data (soft clean out old duplicates first if necessary)
        await db.execute(text("DELETE FROM public.users WHERE email IN ('admin@orbesystems.com.br', 'pedro@orbesystems.com.br', 'juliana@orbesystems.com.br');"))
        
        # Format the cryptographic hashing natively
        def get_hash(pwd="Orbe123!"):
            return bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")
            
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        seed_sql = f"""
        INSERT INTO users (id, email, full_name, hashed_password, password_hash, whatsapp, role, is_active, is_verified, is_email_verified, subscription_status, created_at, updated_at) VALUES 
        ('{str(uuid.uuid4())}', 'admin@orbesystems.com.br', 'Rafael Admin', '{get_hash()}', '{get_hash()}', NULL, 'admin', true, true, true, 'active', '{now}', '{now}'),
        ('{str(uuid.uuid4())}', 'pedro@orbesystems.com.br', 'Pedro Operador', '{get_hash()}', '{get_hash()}', NULL, 'operator', true, true, true, 'active', '{now}', '{now}'),
        ('{str(uuid.uuid4())}', 'juliana@orbesystems.com.br', 'Juliana Rodrigues', '{get_hash()}', '{get_hash()}', '5551984743957', 'client', true, true, true, 'active', '{now}', '{now}');
        """
        
        await db.execute(text(seed_sql))
        await db.commit()
        return {"status": "success", "message": "Database natively re-seeded from AWS Lambda Execution Frame"}

    except Exception as e:
        await db.rollback()
        import traceback
        return {"status": "error", "trace": traceback.format_exc()}

@router.get("/stats", response_model=GlobalStatsOut)
async def get_global_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_super_admin)
):
    # Total de usuários
    users_count = await db.scalar(select(func.count(User.id)))
    
    # Contas ativas
    accounts_count = 0
    
    # Volume total de transações
    tx_volume = 0
    
    # Volume total de vendas PDV
    pdv_volume = await db.scalar(select(func.sum(PDVSale.total_amount)))
    pdv_volume = pdv_volume or 0

    return GlobalStatsOut(
        total_users=users_count,
        active_accounts=accounts_count,
        total_transactions_volume=str(tx_volume),
        total_pdv_sales_volume=str(pdv_volume)
    )

@router.get("/users", response_model=List[UserListOut])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_super_admin)
):
    result = await db.execute(select(User).order_by(User.created_at.desc()).offset(skip).limit(limit))
    users = result.scalars().all()
    return users

@router.patch("/users/{user_id}/role", response_model=UserListOut)
async def update_user_role(
    user_id: uuid.UUID,
    role_update: UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_super_admin)
):
    if str(admin.id) == str(user_id):
        raise HTTPException(status_code=400, detail="Nao pode alterar o proprio cargo")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
        
    user.role = role_update.role
    await db.commit()
    await db.refresh(user)
    return user

@router.patch("/users/{user_id}/status", response_model=UserListOut)
async def update_user_status(
    user_id: uuid.UUID,
    status_update: UserStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_super_admin)
):
    if str(admin.id) == str(user_id):
        raise HTTPException(status_code=400, detail="Nao pode alterar o proprio status")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
        
    user.is_active = status_update.is_active
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/audit-logs", response_model=List[AuditLogOut])
async def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_super_admin)
):
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit))
    logs = result.scalars().all()
    return logs
