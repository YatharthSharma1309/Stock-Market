"""
Integration tests for /api/portfolio/* endpoints.
Market price calls (get_quote, get_quotes_batch) are mocked to avoid
real yfinance/Redis network calls.
"""
import pytest
from unittest.mock import patch
from tests.conftest import register_and_login, auth_headers

# ── fake market data ──────────────────────────────────────────────────────────

FAKE_QUOTE = {"symbol": "AAPL", "name": "Apple Inc.", "price": 200.0, "currency": "USD"}
FAKE_QUOTE_UPDATED = {"symbol": "AAPL", "name": "Apple Inc.", "price": 220.0, "currency": "USD"}


def mock_quote(symbol="AAPL", price=200.0):
    return {"symbol": symbol, "name": "Apple Inc.", "price": price, "currency": "USD"}


# ─── Empty portfolio ──────────────────────────────────────────────────────────

class TestEmptyPortfolio:
    def test_portfolio_starts_with_1m_balance(self, client):
        token = register_and_login(client)
        res = client.get("/api/portfolio", headers=auth_headers(token))
        assert res.status_code == 200
        body = res.json()
        assert body["virtual_balance"] == 1_000_000.0
        assert body["holdings"] == []
        assert body["total_value"] == 1_000_000.0
        assert body["unrealized_pnl"] == 0.0

    def test_trades_empty_for_new_user(self, client):
        token = register_and_login(client)
        res = client.get("/api/portfolio/trades", headers=auth_headers(token))
        assert res.status_code == 200
        assert res.json() == []

    def test_portfolio_requires_auth(self, client):
        assert client.get("/api/portfolio").status_code == 401

    def test_trades_requires_auth(self, client):
        assert client.get("/api/portfolio/trades").status_code == 401


# ─── Buy ─────────────────────────────────────────────────────────────────────

class TestBuy:
    def test_buy_creates_holding(self, client):
        token = register_and_login(client)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=200.0)):
            res = client.post("/api/portfolio/buy",
                              json={"symbol": "AAPL", "quantity": 5},
                              headers=auth_headers(token))
        assert res.status_code == 200
        body = res.json()
        assert "Bought 5" in body["message"]
        assert body["total_cost"] == pytest.approx(1_000.0)
        assert body["new_balance"] == pytest.approx(999_000.0)

    def test_buy_deducts_balance(self, client):
        token = register_and_login(client)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=100.0)):
            client.post("/api/portfolio/buy",
                        json={"symbol": "AAPL", "quantity": 10},
                        headers=auth_headers(token))

        with patch("app.api.portfolio.get_quotes_batch", return_value=[mock_quote(price=100.0)]):
            port = client.get("/api/portfolio", headers=auth_headers(token)).json()

        assert port["virtual_balance"] == pytest.approx(999_000.0)
        assert len(port["holdings"]) == 1
        assert port["holdings"][0]["symbol"] == "AAPL"
        assert port["holdings"][0]["quantity"] == pytest.approx(10.0)

    def test_buy_insufficient_balance_rejected(self, client):
        token = register_and_login(client)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=200_000.0)):
            res = client.post("/api/portfolio/buy",
                              json={"symbol": "AAPL", "quantity": 10},
                              headers=auth_headers(token))
        assert res.status_code == 400
        assert "Insufficient balance" in res.json()["detail"]

    def test_buy_twice_blends_avg_price(self, client):
        token = register_and_login(client)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=100.0)):
            client.post("/api/portfolio/buy",
                        json={"symbol": "AAPL", "quantity": 10},
                        headers=auth_headers(token))
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=200.0)):
            client.post("/api/portfolio/buy",
                        json={"symbol": "AAPL", "quantity": 10},
                        headers=auth_headers(token))

        with patch("app.api.portfolio.get_quotes_batch", return_value=[mock_quote(price=200.0)]):
            port = client.get("/api/portfolio", headers=auth_headers(token)).json()

        holding = port["holdings"][0]
        assert holding["quantity"] == pytest.approx(20.0)
        assert holding["avg_buy_price"] == pytest.approx(150.0)   # (100+200)/2

    def test_buy_requires_auth(self, client):
        res = client.post("/api/portfolio/buy", json={"symbol": "AAPL", "quantity": 1})
        assert res.status_code == 401


# ─── Sell ─────────────────────────────────────────────────────────────────────

class TestSell:
    def _buy(self, client, token, qty=10, price=100.0):
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=price)):
            client.post("/api/portfolio/buy",
                        json={"symbol": "AAPL", "quantity": qty},
                        headers=auth_headers(token))

    def test_sell_adds_proceeds_to_balance(self, client):
        token = register_and_login(client)
        self._buy(client, token, qty=10, price=100.0)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=150.0)):
            res = client.post("/api/portfolio/sell",
                              json={"symbol": "AAPL", "quantity": 5},
                              headers=auth_headers(token))
        assert res.status_code == 200
        assert res.json()["proceeds"] == pytest.approx(750.0)
        # balance: 1_000_000 - 1_000 (buy) + 750 (sell) = 999_750
        assert res.json()["new_balance"] == pytest.approx(999_750.0)

    def test_sell_removes_holding_when_fully_sold(self, client):
        token = register_and_login(client)
        self._buy(client, token, qty=10, price=100.0)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=100.0)):
            client.post("/api/portfolio/sell",
                        json={"symbol": "AAPL", "quantity": 10},
                        headers=auth_headers(token))

        with patch("app.api.portfolio.get_quotes_batch", return_value=[]):
            port = client.get("/api/portfolio", headers=auth_headers(token)).json()

        assert port["holdings"] == []

    def test_sell_more_than_owned_rejected(self, client):
        token = register_and_login(client)
        self._buy(client, token, qty=5)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote()):
            res = client.post("/api/portfolio/sell",
                              json={"symbol": "AAPL", "quantity": 10},
                              headers=auth_headers(token))
        assert res.status_code == 400
        assert "Insufficient holdings" in res.json()["detail"]

    def test_sell_unowned_symbol_rejected(self, client):
        token = register_and_login(client)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote()):
            res = client.post("/api/portfolio/sell",
                              json={"symbol": "AAPL", "quantity": 1},
                              headers=auth_headers(token))
        assert res.status_code == 400

    def test_sell_requires_auth(self, client):
        res = client.post("/api/portfolio/sell", json={"symbol": "AAPL", "quantity": 1})
        assert res.status_code == 401


# ─── Trade history ────────────────────────────────────────────────────────────

class TestTradeHistory:
    def test_buy_recorded_in_history(self, client):
        token = register_and_login(client)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=200.0)):
            client.post("/api/portfolio/buy",
                        json={"symbol": "AAPL", "quantity": 3},
                        headers=auth_headers(token))

        trades = client.get("/api/portfolio/trades", headers=auth_headers(token)).json()
        assert len(trades) == 1
        assert trades[0]["trade_type"] == "buy"
        assert trades[0]["symbol"] == "AAPL"
        assert trades[0]["quantity"] == pytest.approx(3.0)
        assert trades[0]["price"] == pytest.approx(200.0)

    def test_sell_recorded_in_history(self, client):
        token = register_and_login(client)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=100.0)):
            client.post("/api/portfolio/buy", json={"symbol": "AAPL", "quantity": 10}, headers=auth_headers(token))
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=120.0)):
            client.post("/api/portfolio/sell", json={"symbol": "AAPL", "quantity": 5}, headers=auth_headers(token))

        trades = client.get("/api/portfolio/trades", headers=auth_headers(token)).json()
        assert len(trades) == 2
        types = {t["trade_type"] for t in trades}
        assert types == {"buy", "sell"}

    def test_trades_ordered_newest_first(self, client):
        token = register_and_login(client)
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=100.0)):
            client.post("/api/portfolio/buy", json={"symbol": "AAPL", "quantity": 1}, headers=auth_headers(token))
        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=110.0)):
            client.post("/api/portfolio/buy", json={"symbol": "AAPL", "quantity": 1}, headers=auth_headers(token))

        trades = client.get("/api/portfolio/trades", headers=auth_headers(token)).json()
        # newest first → second buy (price=110) should come first
        assert trades[0]["price"] == pytest.approx(110.0)
        assert trades[1]["price"] == pytest.approx(100.0)

    def test_users_cannot_see_each_others_trades(self, client):
        tok1 = register_and_login(client, email="a@test.com", username="userone")
        tok2 = register_and_login(client, email="b@test.com", username="usertwo")

        with patch("app.api.portfolio.get_quote", return_value=mock_quote(price=100.0)):
            client.post("/api/portfolio/buy", json={"symbol": "AAPL", "quantity": 1}, headers=auth_headers(tok1))

        trades2 = client.get("/api/portfolio/trades", headers=auth_headers(tok2)).json()
        assert trades2 == []
