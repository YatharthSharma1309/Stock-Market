from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import Holding, Trade
from app.services.market import get_quotes_batch

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

STARTING_BALANCE = 1_000_000.0


@router.get("")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_active == True).order_by(User.created_at).all()

    all_holdings = db.query(Holding).all()
    holdings_by_user: dict[str, list[Holding]] = {}
    for h in all_holdings:
        holdings_by_user.setdefault(str(h.user_id), []).append(h)

    symbols = list({h.symbol for h in all_holdings})
    price_map: dict[str, float] = {}
    if symbols:
        quotes = get_quotes_batch(symbols)
        price_map = {
            q["symbol"]: q.get("price") or float(
                next((h.avg_buy_price for h in all_holdings if h.symbol == q["symbol"]), 0)
            )
            for q in quotes
        }

    trade_counts: dict[str, int] = dict(
        db.query(Trade.user_id, func.count(Trade.id)).group_by(Trade.user_id).all()
    )

    entries = []
    for user in users:
        balance = float(user.virtual_balance)
        user_holdings = holdings_by_user.get(str(user.id), [])
        holdings_value = sum(
            float(h.quantity) * price_map.get(h.symbol, float(h.avg_buy_price))
            for h in user_holdings
        )
        total_value = balance + holdings_value
        return_pct = (total_value - STARTING_BALANCE) / STARTING_BALANCE * 100
        entries.append({
            "username": user.username,
            "total_value": round(total_value, 2),
            "return_pct": round(return_pct, 2),
            "num_trades": trade_counts.get(user.id, 0),
        })

    entries.sort(key=lambda x: x["return_pct"], reverse=True)
    return [{"rank": i + 1, **e} for i, e in enumerate(entries)]
