"""
INHO – Database Models
User (RBAC) | Account | Transaction | AuditLog (immutable)
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey,
    String, Text, Index, Numeric, Integer
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from db.session import Base


# ── Enums ─────────────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN       = "admin"
    OPERATOR    = "operator"
    VIEWER      = "viewer"
    CLIENT      = "client"


class AuditAction(str, enum.Enum):
    CREATE       = "CREATE"
    READ         = "READ"
    UPDATE       = "UPDATE"
    DELETE       = "DELETE"
    LOGIN        = "LOGIN"
    LOGOUT       = "LOGOUT"
    FAILED_LOGIN = "FAILED_LOGIN"


# ── User ──────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    full_name       = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(Enum(UserRole), nullable=False, default=UserRole.CLIENT)
    is_active       = Column(Boolean, default=True, nullable=False)
    is_verified     = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_users_email_active", "email", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<User {self.email} [{self.role}]>"




# ── AuditLog (IMMUTABLE) ──────────────────────────────────────────
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action     = Column(Enum(AuditAction), nullable=False)
    entity     = Column(String(100), nullable=False)
    entity_id  = Column(String(255), nullable=True)
    detail     = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(512), nullable=True)
    timestamp  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_audit_user_action", "user_id", "action"),
        Index("ix_audit_entity",      "entity",  "entity_id"),
        Index("ix_audit_timestamp",   "timestamp"),
    )

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} on {self.entity}>"




# ── ContractStatus / Contract ────────────────────────────────────
class ContractStatus(str, enum.Enum):
    ACTIVE    = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    EXPIRED   = "EXPIRED"
    CANCELLED = "CANCELLED"


class Contract(Base):
    """Contrato ativo vinculado a uma recorrência"""
    __tablename__ = "contracts"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title        = Column(String(255), nullable=False)
    contact_name = Column(String(255), nullable=False)
    contact_doc  = Column(String(20), nullable=True)
    record_type  = Column(String(20), nullable=False)  # PAYABLE or RECEIVABLE
    total_value  = Column(Numeric(precision=20, scale=8), nullable=False)
    installments = Column(Integer, nullable=False, default=1)
    frequency    = Column(String(20), nullable=True)
    start_date   = Column(DateTime(timezone=True), nullable=False)
    end_date     = Column(DateTime(timezone=True), nullable=True)
    status       = Column(Enum(ContractStatus), nullable=False, default=ContractStatus.ACTIVE)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_contracts_status", "status"),
    )


# ── SalesOrderStatus / SalesOrder ─────────────────────────────────
class SalesOrderStatus(str, enum.Enum):
    DRAFT     = "DRAFT"
    CONFIRMED = "CONFIRMED"
    INVOICED  = "INVOICED"
    CANCELLED = "CANCELLED"


class SalesOrder(Base):
    """Pedido de Venda"""
    __tablename__ = "sales_orders"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_name  = Column(String(255), nullable=False)
    customer_doc   = Column(String(20), nullable=True)
    description    = Column(Text, nullable=True)
    amount         = Column(Numeric(precision=20, scale=8), nullable=False)
    status         = Column(Enum(SalesOrderStatus), nullable=False, default=SalesOrderStatus.DRAFT)
    invoice_number = Column(String(100), nullable=True)
    nfe_key        = Column(String(50), nullable=True)
    nfe_status     = Column(String(50), nullable=True)
    issue_date     = Column(DateTime(timezone=True), nullable=False)
    due_date       = Column(DateTime(timezone=True), nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_sales_orders_status", "status"),
    )


# ── PaymentMethod / CashRegister / PDVSale ────────────────────────
class PaymentMethod(str, enum.Enum):
    CASH        = "CASH"
    PIX         = "PIX"
    DEBIT_CARD  = "DEBIT_CARD"
    CREDIT_CARD = "CREDIT_CARD"
    CHECK       = "CHECK"
    OTHER       = "OTHER"


class CashRegisterStatus(str, enum.Enum):
    OPEN   = "OPEN"
    CLOSED = "CLOSED"


class CashRegister(Base):
    """Sessão de caixa (abertura e fechamento do dia)"""
    __tablename__ = "cash_registers"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    operator_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    opening_balance = Column(Numeric(precision=20, scale=8), nullable=False, default=0)
    closing_balance = Column(Numeric(precision=20, scale=8), nullable=True)
    status          = Column(Enum(CashRegisterStatus), nullable=False, default=CashRegisterStatus.OPEN)
    opened_at       = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    closed_at       = Column(DateTime(timezone=True), nullable=True)

    sales = relationship("PDVSale", back_populates="cash_register", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_cash_registers_status", "status"),
    )


class PDVSale(Base):
    """Venda registrada no PDV"""
    __tablename__ = "pdv_sales"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cash_register_id = Column(UUID(as_uuid=True), ForeignKey("cash_registers.id", ondelete="CASCADE"), nullable=False)
    customer_name    = Column(String(255), nullable=True)
    total_amount     = Column(Numeric(precision=20, scale=8), nullable=False)
    payment_method   = Column(Enum(PaymentMethod), nullable=False)
    description      = Column(Text, nullable=True)
    created_at       = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    cash_register = relationship("CashRegister", back_populates="sales")

    __table_args__ = (
        Index("ix_pdv_sales_register", "cash_register_id"),
        Index("ix_pdv_sales_created", "created_at"),
    )


