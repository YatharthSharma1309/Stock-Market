import logging
from anthropic import AsyncAnthropic
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.portfolio import Holding, Trade
from app.models.user import User
from app.schemas.ai import ChatContext

logger = logging.getLogger(__name__)

MODEL = "claude-3-5-haiku-20241022"
MAX_TOKENS = 1024
HISTORY_LIMIT = 20   # messages fed to Claude (10 exchanges)
HISTORY_STORE = 50   # messages stored & shown in UI

_client: AsyncAnthropic | None = None


def get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        _client = AsyncAnthropic(api_key=settings.CLAUDE_API_KEY)
    return _client


PERSONA = """You are an AI trading coach embedded in StockSim Pro, a paper trading \
simulator for learning stock market investing. The user trades with virtual money — \
no real money is at risk.

Your role:
- Explain trading concepts, indicators, and stock fundamentals clearly
- Analyse the user's portfolio and provide specific, actionable feedback
- Explain why a trade gained or lost value using market context
- Provide personalised coaching based on the user's trade history
- Offer market commentary and trend analysis

Tone: educational, encouraging, concise. Avoid jargon unless you explain it immediately \
after. Use Indian Rupees (₹) for INR-denominated stocks (symbols ending in .NS or .BO) \
and USD ($) for global stocks. Always clarify this is a simulator — never imply real \
financial advice.

Format your responses in plain text. Use short paragraphs. Use bullet points for lists \
of 3 or more items. Do not use markdown headers or bold text."""


def _currency(symbol: str) -> str:
    return "₹" if symbol.endswith(".NS") or symbol.endswith(".BO") else "$"


def build_portfolio_context(user: User, db: Session) -> str:
    holdings = db.query(Holding).filter(Holding.user_id == user.id).all()
    trades = (
        db.query(Trade)
        .filter(Trade.user_id == user.id)
        .order_by(Trade.created_at.desc())
        .limit(10)
        .all()
    )

    if not holdings and not trades:
        return ""

    lines = [f"\nUser's current portfolio (paper trading):"]
    lines.append(f"- Cash balance: ₹{float(user.virtual_balance):,.2f}")

    if holdings:
        lines.append(f"- Holdings ({len(holdings)} stocks):")
        for h in holdings:
            cur = _currency(h.symbol)
            qty = float(h.quantity)
            avg = float(h.avg_buy_price)
            lines.append(f"  • {h.symbol} ({h.name}): {qty} shares @ avg {cur}{avg:.2f}")

    if trades:
        lines.append("- Recent trades (last 10):")
        for t in trades:
            cur = _currency(t.symbol)
            d = t.created_at.strftime("%Y-%m-%d")
            lines.append(
                f"  • {d}  {t.trade_type.upper()}  {float(t.quantity)} {t.symbol} @ {cur}{float(t.price):.2f}"
            )

    return "\n".join(lines)


def build_system_prompt(user: User, context: ChatContext | None, db: Session) -> str:
    parts = [PERSONA]

    portfolio_ctx = build_portfolio_context(user, db)
    if portfolio_ctx:
        parts.append(portfolio_ctx)

    if context:
        if context.type == "stock" and context.symbol:
            cur = _currency(context.symbol)
            price_str = f"{cur}{context.price:.2f}" if context.price is not None else "unknown"
            chg_str = f"{context.change_pct:+.2f}%" if context.change_pct is not None else "unknown"
            parts.append(
                f"\nThe user is currently viewing: {context.symbol}"
                + (f" ({context.name})" if context.name else "")
                + f"\nCurrent price: {price_str} | Change today: {chg_str}"
            )
        elif context.type == "portfolio":
            parts.append("\nThe user wants an analysis of their overall portfolio.")
        elif context.type == "trade" and context.symbol:
            cur = _currency(context.symbol)
            price_str = f"{cur}{context.price:.2f}" if context.price is not None else "unknown"
            parts.append(
                f"\nThe user is asking about this specific trade:\n"
                f"{(context.trade_type or '').upper()} {context.quantity or ''} {context.symbol} "
                f"@ {price_str}" + (f" on {context.trade_date}" if context.trade_date else "")
            )

    return "\n\n".join(parts)
