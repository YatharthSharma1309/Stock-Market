import json
import math
import logging
from datetime import timezone as _tz
import yfinance as yf
from app.core.redis_client import redis_client

logger = logging.getLogger(__name__)

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
        return None if math.isnan(v) else v
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
        "volume": _safe_float(getattr(fi, "regular_market_volume", None)),
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
        except Exception as e:
            logger.warning(f"Failed to fetch quote for {s}: {e}")

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


HISTORY_CACHE_TTL = {"1D": 60, "1W": 300, "1M": 600, "3M": 1800, "1Y": 3600}
HISTORY_RANGE_MAP = {
    "1D": ("1d", "5m"),
    "1W": ("5d", "30m"),
    "1M": ("1mo", "1d"),
    "3M": ("3mo", "1d"),
    "1Y": ("1y", "1wk"),
}


def get_history(symbol: str, range_key: str = "1M") -> list[dict]:
    range_key = range_key.upper()
    cache_key = f"history:{symbol}:{range_key}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    period, interval = HISTORY_RANGE_MAP.get(range_key, ("1mo", "1d"))
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval)

    if df.empty:
        return []

    result = []
    for t, row in df.iterrows():
        try:
            if hasattr(t, "tzinfo") and t.tzinfo is not None:
                unix_time = int(t.timestamp())
            else:
                unix_time = int(t.replace(tzinfo=_tz.utc).timestamp())
        except Exception as e:
            logger.warning(f"Skipping candle for {symbol} at {t}: {e}")
            continue

        o, h, l, c = float(row["Open"]), float(row["High"]), float(row["Low"]), float(row["Close"])
        v = float(row["Volume"])
        if any(math.isnan(x) for x in (o, h, l, c)):
            continue

        result.append({
            "time": unix_time,
            "open": round(o, 4),
            "high": round(h, 4),
            "low": round(l, 4),
            "close": round(c, 4),
            "volume": int(v) if not math.isnan(v) else 0,
        })

    ttl = HISTORY_CACHE_TTL.get(range_key, 3600)
    redis_client.setex(cache_key, ttl, json.dumps(result))
    return result


def search_stocks(query: str) -> list[dict]:
    q = query.lower()
    return [
        s for s in ALL_STOCKS
        if q in s["symbol"].lower() or q in s["name"].lower()
    ][:20]
