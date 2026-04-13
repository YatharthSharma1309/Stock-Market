from fastapi import APIRouter, HTTPException
from app.services.market import (
    get_quote, get_quotes_batch, get_indices, search_stocks,
    NSE_STOCKS, GLOBAL_STOCKS,
)

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/indices")
def indices():
    return get_indices()


@router.get("/quote/{symbol}")
def quote(symbol: str):
    try:
        return get_quote(symbol.upper())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch quote: {str(e)}")


@router.get("/quotes")
def quotes(symbols: str):
    sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    if not sym_list:
        raise HTTPException(status_code=400, detail="No symbols provided")
    return get_quotes_batch(sym_list)


@router.get("/search")
def search(q: str):
    if len(q) < 1:
        raise HTTPException(status_code=400, detail="Query too short")
    return search_stocks(q)


@router.get("/nse")
def nse_stocks():
    symbols = [s["symbol"] for s in NSE_STOCKS]
    return get_quotes_batch(symbols)


@router.get("/global")
def global_stocks():
    symbols = [s["symbol"] for s in GLOBAL_STOCKS]
    return get_quotes_batch(symbols)
