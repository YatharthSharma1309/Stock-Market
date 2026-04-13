import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class TradeRequest(BaseModel):
    symbol: str
    quantity: float = Field(gt=0, description="Number of shares (must be positive)")


class HoldingOut(BaseModel):
    symbol: str
    name: str
    quantity: float
    avg_buy_price: float
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    unrealized_pnl: Optional[float] = None
    unrealized_pnl_pct: Optional[float] = None

    class Config:
        from_attributes = True


class TradeOut(BaseModel):
    id: uuid.UUID
    symbol: str
    name: str
    trade_type: str
    quantity: float
    price: float
    total_value: float
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioSummary(BaseModel):
    virtual_balance: float
    holdings_value: float
    total_value: float
    total_invested: float
    unrealized_pnl: float
    unrealized_pnl_pct: float
    holdings: List[HoldingOut]
