from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ChatContext(BaseModel):
    type: str                        # "stock" | "portfolio" | "trade" | "general"
    symbol: Optional[str] = None
    name: Optional[str] = None
    price: Optional[float] = None
    change_pct: Optional[float] = None
    trade_type: Optional[str] = None
    quantity: Optional[float] = None
    trade_date: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    context: Optional[ChatContext] = None


class HistoryMessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime
