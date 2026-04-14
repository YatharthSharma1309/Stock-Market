"""
Unit tests for app/services/market.py
These tests cover pure functions and Redis-cached logic (Redis is mocked).
"""
import math
import json
import pytest
from unittest.mock import MagicMock, patch


# ─── _safe_float ─────────────────────────────────────────────────────────────

def test_safe_float_valid_int():
    from app.services.market import _safe_float
    assert _safe_float(42) == 42.0

def test_safe_float_valid_float():
    from app.services.market import _safe_float
    assert _safe_float(3.14159) == pytest.approx(3.14159)

def test_safe_float_string_number():
    from app.services.market import _safe_float
    assert _safe_float("99.5") == pytest.approx(99.5)

def test_safe_float_nan_returns_none():
    from app.services.market import _safe_float
    assert _safe_float(float("nan")) is None

def test_safe_float_invalid_string_returns_none():
    from app.services.market import _safe_float
    assert _safe_float("not_a_number") is None

def test_safe_float_none_returns_none():
    from app.services.market import _safe_float
    assert _safe_float(None) is None

def test_safe_float_zero():
    from app.services.market import _safe_float
    assert _safe_float(0) == 0.0


# ─── search_stocks ──────────────────────────────────────────────────────────

def test_search_by_symbol_exact():
    from app.services.market import search_stocks
    results = search_stocks("AAPL")
    assert any(r["symbol"] == "AAPL" for r in results)

def test_search_by_symbol_partial():
    from app.services.market import search_stocks
    results = search_stocks("RELIANCE")
    assert any("RELIANCE" in r["symbol"] for r in results)

def test_search_by_name_case_insensitive():
    from app.services.market import search_stocks
    results = search_stocks("apple")
    assert any(r["symbol"] == "AAPL" for r in results)

def test_search_nse_stock_by_name():
    from app.services.market import search_stocks
    results = search_stocks("tata consultancy")
    assert any(r["symbol"] == "TCS.NS" for r in results)

def test_search_no_match_returns_empty():
    from app.services.market import search_stocks
    results = search_stocks("XYZNOTREAL123")
    assert results == []

def test_search_max_results_20():
    from app.services.market import search_stocks
    # Empty string matches everything but cap is 20
    results = search_stocks("")
    assert len(results) <= 20


# ─── get_quotes_batch with cached data ───────────────────────────────────────

def test_get_quotes_batch_returns_cached_data(mocker):
    cached_quote = {"symbol": "AAPL", "price": 180.5, "name": "Apple Inc."}
    mock_redis = mocker.patch("app.services.market.redis_client")
    mock_redis.get.return_value = json.dumps(cached_quote)

    from app.services.market import get_quotes_batch
    results = get_quotes_batch(["AAPL"])

    assert len(results) == 1
    assert results[0]["symbol"] == "AAPL"
    assert results[0]["price"] == pytest.approx(180.5)
    mock_redis.get.assert_called_once_with("quote:AAPL")

def test_get_quotes_batch_empty_list(mocker):
    mocker.patch("app.services.market.redis_client")
    from app.services.market import get_quotes_batch
    results = get_quotes_batch([])
    assert results == []

def test_get_quotes_batch_preserves_order(mocker):
    quotes = {
        "AAPL": {"symbol": "AAPL", "price": 180.0},
        "MSFT": {"symbol": "MSFT", "price": 420.0},
    }
    mock_redis = mocker.patch("app.services.market.redis_client")
    mock_redis.get.side_effect = lambda key: json.dumps(quotes[key.split(":")[1]])

    from app.services.market import get_quotes_batch
    results = get_quotes_batch(["AAPL", "MSFT"])

    assert results[0]["symbol"] == "AAPL"
    assert results[1]["symbol"] == "MSFT"


# ─── Portfolio P&L logic (pure math, no DB) ──────────────────────────────────

class TestPortfolioPnL:
    def test_average_cost_blended_correctly(self):
        """Buying more shares blends avg price correctly."""
        old_qty, old_avg = 10.0, 100.0
        new_qty, new_price = 5.0, 120.0
        total = old_qty + new_qty
        new_avg = (old_qty * old_avg + new_qty * new_price) / total
        assert new_avg == pytest.approx(106.6667, rel=1e-4)

    def test_pnl_positive_position(self):
        qty, avg_buy, cur_price = 10.0, 100.0, 130.0
        invested = qty * avg_buy
        cur_value = qty * cur_price
        pnl = cur_value - invested
        pnl_pct = (pnl / invested) * 100
        assert pnl == pytest.approx(300.0)
        assert pnl_pct == pytest.approx(30.0)

    def test_pnl_negative_position(self):
        qty, avg_buy, cur_price = 10.0, 100.0, 80.0
        invested = qty * avg_buy
        cur_value = qty * cur_price
        pnl = cur_value - invested
        pnl_pct = (pnl / invested) * 100
        assert pnl == pytest.approx(-200.0)
        assert pnl_pct == pytest.approx(-20.0)

    def test_total_portfolio_value(self):
        virtual_balance = 500_000.0
        holdings_value = 300_000.0
        total = virtual_balance + holdings_value
        assert total == pytest.approx(800_000.0)

    def test_leaderboard_return_pct(self):
        STARTING = 1_000_000.0
        total_value = 1_150_000.0
        return_pct = (total_value - STARTING) / STARTING * 100
        assert return_pct == pytest.approx(15.0)

    def test_leaderboard_negative_return(self):
        STARTING = 1_000_000.0
        total_value = 900_000.0
        return_pct = (total_value - STARTING) / STARTING * 100
        assert return_pct == pytest.approx(-10.0)
