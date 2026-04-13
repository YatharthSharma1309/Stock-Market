import json
import yfinance as yf
from app.core.redis_client import redis_client

CACHE_TTL = 15  # seconds

INDICES = {
    "NIFTY 50": "^NSEI",
    "SENSEX": "^BSESN",
    "S&P 500": "^GSPC",
    "NASDAQ": "^IXIC",
    "Dow Jones": "^DJI",
}

NSE_STOCKS = [
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services"},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank"},
    {"symbol": "INFY.NS", "name": "Infosys"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank"},
    {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever"},
    {"symbol": "SBIN.NS", "name": "State Bank of India"},
    {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance"},
    {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank"},
    {"symbol": "AXISBANK.NS", "name": "Axis Bank"},
    {"symbol": "WIPRO.NS", "name": "Wipro"},
    {"symbol": "HCLTECH.NS", "name": "HCL Technologies"},
    {"symbol": "ASIANPAINT.NS", "name": "Asian Paints"},
    {"symbol": "MARUTI.NS", "name": "Maruti Suzuki"},
    {"symbol": "SUNPHARMA.NS", "name": "Sun Pharmaceutical"},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors"},
    {"symbol": "ADANIENT.NS", "name": "Adani Enterprises"},
    {"symbol": "ONGC.NS", "name": "Oil & Natural Gas Corp"},
    {"symbol": "POWERGRID.NS", "name": "Power Grid Corp"},
    {"symbol": "NTPC.NS", "name": "NTPC"},
]

GLOBAL_STOCKS = [
    {"symbol": "AAPL", "name": "Apple Inc."},
    {"symbol": "MSFT", "name": "Microsoft Corp."},
    {"symbol": "GOOGL", "name": "Alphabet Inc."},
    {"symbol": "AMZN", "name": "Amazon.com Inc."},
    {"symbol": "NVDA", "name": "NVIDIA Corp."},
    {"symbol": "META", "name": "Meta Platforms Inc."},
    {"symbol": "TSLA", "name": "Tesla Inc."},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
    {"symbol": "V", "name": "Visa Inc."},
    {"symbol": "JNJ", "name": "Johnson & Johnson"},
    {"symbol": "WMT", "name": "Walmart Inc."},
    {"symbol": "XOM", "name": "Exxon Mobil Corp."},
    {"symbol": "NFLX", "name": "Netflix Inc."},
    {"symbol": "BABA", "name": "Alibaba Group"},
    {"symbol": "TSM", "name": "Taiwan Semiconductor"},
    {"symbol": "ORCL", "name": "Oracle Corp."},
    {"symbol": "INTC", "name": "Intel Corp."},
    {"symbol": "AMD", "name": "Advanced Micro Devices"},
    {"symbol": "PYPL", "name": "PayPal Holdings"},
    {"symbol": "UBER", "name": "Uber Technologies"},
]

ALL_STOCKS = NSE_STOCKS + GLOBAL_STOCKS


def _safe_float(val) -> float | None:
    try:
        v = float(val)
        return None if v != v else v  # NaN check
    except Exception:
        return None


def _fetch_quote(symbol: str) -> dict:
    ticker = yf.Ticker(symbol)
    fi = ticker.fast_info
    price = _safe_float(getattr(fi, "last_price", None))
    prev = _safe_float(getattr(fi, "previous_close", None))
    change = round(price - prev, 2) if price and prev else None
    change_pct = round((change / prev) * 100, 2) if change and prev else None
    name = next((s["name"] for s in ALL_STOCKS if s["symbol"] == symbol), symbol)
    return {
        "symbol": symbol,
        "name": name,
        "price": price,
        "change": change,
        "change_pct": change_pct,
        "open": _safe_float(getattr(fi, "open", None)),
        "high": _safe_float(getattr(fi, "day_high", None)),
        "low": _safe_float(getattr(fi, "day_low", None)),
        "prev_close": prev,
        "volume": _safe_float(getattr(fi, "three_month_average_volume", None)),
        "market_cap": _safe_float(getattr(fi, "market_cap", None)),
        "currency": getattr(fi, "currency", None),
    }


def get_quote(symbol: str) -> dict:
    key = f"quote:{symbol}"
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)
    data = _fetch_quote(symbol)
    redis_client.setex(key, CACHE_TTL, json.dumps(data))
    return data


def get_quotes_batch(symbols: list[str]) -> list[dict]:
    results = []
    missing = []
    cache_map = {}

    for s in symbols:
        key = f"quote:{s}"
        cached = redis_client.get(key)
        if cached:
            cache_map[s] = json.loads(cached)
        else:
            missing.append(s)

    for s in missing:
        try:
            data = _fetch_quote(s)
            redis_client.setex(f"quote:{s}", CACHE_TTL, json.dumps(data))
            cache_map[s] = data
        except Exception:
            pass

    for s in symbols:
        if s in cache_map:
            results.append(cache_map[s])

    return results


def get_indices() -> list[dict]:
    symbols = list(INDICES.values())
    raw = get_quotes_batch(symbols)
    out = []
    for name, sym in INDICES.items():
        entry = next((r for r in raw if r["symbol"] == sym), None)
        if entry:
            entry = dict(entry)
            entry["index_name"] = name
            out.append(entry)
    return out


def search_stocks(query: str) -> list[dict]:
    q = query.lower()
    return [
        s for s in ALL_STOCKS
        if q in s["symbol"].lower() or q in s["name"].lower()
    ][:20]
