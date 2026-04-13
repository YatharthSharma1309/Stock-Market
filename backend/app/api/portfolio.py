from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.portfolio import Holding, Trade
from app.schemas.portfolio import TradeRequest, TradeOut, PortfolioSummary, HoldingOut
from app.services.market import get_quote, get_quotes_batch, ALL_STOCKS

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

_STOCK_NAMES = {s["symbol"]: s["name"] for s in ALL_STOCKS}


def _stock_name(symbol: str) -> str:
    return _STOCK_NAMES.get(symbol, symbol)


@router.post("/buy")
def buy_stock(
    req: TradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    symbol = req.symbol.upper()

    try:
        quote = get_quote(symbol)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch price: {e}")

    price = quote.get("price")
    if not price:
        raise HTTPException(status_code=502, detail="Price unavailable for this symbol")

    total_cost = Decimal(str(price)) * Decimal(str(req.quantity))

    if current_user.virtual_balance < total_cost:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Need ₹{total_cost:.2f}, available ₹{current_user.virtual_balance:.2f}",
        )

    current_user.virtual_balance -= total_cost

    holding = db.query(Holding).filter(
        Holding.user_id == current_user.id, Holding.symbol == symbol
    ).first()

    if holding:
        old_qty = float(holding.quantity)
        old_avg = float(holding.avg_buy_price)
        new_qty = old_qty + req.quantity
        new_avg = (old_qty * old_avg + req.quantity * price) / new_qty
        holding.quantity = Decimal(str(new_qty))
        holding.avg_buy_price = Decimal(str(round(new_avg, 4)))
    else:
        holding = Holding(
            user_id=current_user.id,
            symbol=symbol,
            name=_stock_name(symbol),
            quantity=Decimal(str(req.quantity)),
            avg_buy_price=Decimal(str(price)),
        )
        db.add(holding)

    trade = Trade(
        user_id=current_user.id,
        symbol=symbol,
        name=_stock_name(symbol),
        trade_type="buy",
        quantity=Decimal(str(req.quantity)),
        price=Decimal(str(price)),
        total_value=total_cost,
    )
    db.add(trade)
    db.commit()

    return {
        "message": f"Bought {req.quantity} {symbol} at {price:.2f}",
        "total_cost": float(total_cost),
        "new_balance": float(current_user.virtual_balance),
    }


@router.post("/sell")
def sell_stock(
    req: TradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    symbol = req.symbol.upper()

    holding = db.query(Holding).filter(
        Holding.user_id == current_user.id, Holding.symbol == symbol
    ).first()

    owned = float(holding.quantity) if holding else 0.0
    if not holding or owned < req.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient holdings. You own {owned} {symbol}",
        )

    try:
        quote = get_quote(symbol)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch price: {e}")

    price = quote.get("price")
    if not price:
        raise HTTPException(status_code=502, detail="Price unavailable for this symbol")

    proceeds = Decimal(str(price)) * Decimal(str(req.quantity))
    current_user.virtual_balance += proceeds

    new_qty = owned - req.quantity
    if new_qty <= 0:
        db.delete(holding)
    else:
        holding.quantity = Decimal(str(new_qty))

    trade = Trade(
        user_id=current_user.id,
        symbol=symbol,
        name=_stock_name(symbol),
        trade_type="sell",
        quantity=Decimal(str(req.quantity)),
        price=Decimal(str(price)),
        total_value=proceeds,
    )
    db.add(trade)
    db.commit()

    return {
        "message": f"Sold {req.quantity} {symbol} at {price:.2f}",
        "proceeds": float(proceeds),
        "new_balance": float(current_user.virtual_balance),
    }


@router.get("/trades", response_model=list[TradeOut])
def get_trades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Trade)
        .filter(Trade.user_id == current_user.id)
        .order_by(Trade.created_at.desc())
        .all()
    )


@router.get("", response_model=PortfolioSummary)
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()

    holdings_out = []
    total_invested = 0.0
    holdings_value = 0.0

    if holdings:
        symbols = [h.symbol for h in holdings]
        quotes = get_quotes_batch(symbols)
        price_map = {q["symbol"]: q.get("price") for q in quotes}

        for h in holdings:
            qty = float(h.quantity)
            avg = float(h.avg_buy_price)
            invested = qty * avg
            total_invested += invested

            cur_price = price_map.get(h.symbol)
            cur_value = qty * cur_price if cur_price else None
            if cur_value:
                holdings_value += cur_value

            pnl = round(cur_value - invested, 2) if cur_value is not None else None
            pnl_pct = round((pnl / invested) * 100, 2) if pnl is not None and invested > 0 else None

            holdings_out.append(HoldingOut(
                symbol=h.symbol,
                name=h.name,
                quantity=qty,
                avg_buy_price=round(avg, 4),
                current_price=cur_price,
                current_value=round(cur_value, 2) if cur_value is not None else None,
                unrealized_pnl=pnl,
                unrealized_pnl_pct=pnl_pct,
            ))

    virtual_balance = float(current_user.virtual_balance)
    total_value = virtual_balance + holdings_value
    unrealized_pnl = holdings_value - total_invested
    unrealized_pnl_pct = round((unrealized_pnl / total_invested) * 100, 2) if total_invested > 0 else 0.0

    return PortfolioSummary(
        virtual_balance=round(virtual_balance, 2),
        holdings_value=round(holdings_value, 2),
        total_value=round(total_value, 2),
        total_invested=round(total_invested, 2),
        unrealized_pnl=round(unrealized_pnl, 2),
        unrealized_pnl_pct=unrealized_pnl_pct,
        holdings=holdings_out,
    )
