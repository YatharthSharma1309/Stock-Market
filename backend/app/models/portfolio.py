import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


def _now():
    return datetime.now(timezone.utc)


class Holding(Base):
    __tablename__ = "holdings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    symbol = Column(String, nullable=False)
    name = Column(String, nullable=False)
    quantity = Column(Numeric(precision=15, scale=4), nullable=False)
    avg_buy_price = Column(Numeric(precision=15, scale=4), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)


class Trade(Base):
    __tablename__ = "trades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    symbol = Column(String, nullable=False)
    name = Column(String, nullable=False)
    trade_type = Column(String, nullable=False)  # 'buy' or 'sell'
    quantity = Column(Numeric(precision=15, scale=4), nullable=False)
    price = Column(Numeric(precision=15, scale=4), nullable=False)
    total_value = Column(Numeric(precision=15, scale=2), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now)
