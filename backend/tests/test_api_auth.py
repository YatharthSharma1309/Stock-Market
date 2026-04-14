"""
Integration tests for /api/auth/* endpoints.
Uses SQLite in-memory DB via the `client` fixture from conftest.py.
"""
import pytest
from tests.conftest import register_and_login, auth_headers


VALID_USER = {
    "email": "alice@example.com",
    "username": "alice",
    "password": "securepass1",
}


# ─── Register ────────────────────────────────────────────────────────────────

class TestRegister:
    def test_register_returns_jwt(self, client):
        res = client.post("/api/auth/register", json=VALID_USER)
        assert res.status_code == 201
        body = res.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"
        assert len(body["access_token"]) > 10

    def test_register_duplicate_email_rejected(self, client):
        client.post("/api/auth/register", json=VALID_USER)
        res = client.post("/api/auth/register", json=VALID_USER)
        assert res.status_code == 400
        assert "Email already registered" in res.json()["detail"]

    def test_register_duplicate_username_rejected(self, client):
        client.post("/api/auth/register", json=VALID_USER)
        other = {**VALID_USER, "email": "other@example.com"}
        res = client.post("/api/auth/register", json=other)
        assert res.status_code == 400
        assert "Username already taken" in res.json()["detail"]

    def test_register_short_password_rejected(self, client):
        bad = {**VALID_USER, "password": "short"}
        res = client.post("/api/auth/register", json=bad)
        assert res.status_code == 422

    def test_register_invalid_username_rejected(self, client):
        bad = {**VALID_USER, "username": "a b"}   # space not allowed
        res = client.post("/api/auth/register", json=bad)
        assert res.status_code == 422

    def test_register_invalid_email_rejected(self, client):
        bad = {**VALID_USER, "email": "not-an-email"}
        res = client.post("/api/auth/register", json=bad)
        assert res.status_code == 422


# ─── Login ───────────────────────────────────────────────────────────────────

class TestLogin:
    def test_login_success(self, client):
        client.post("/api/auth/register", json=VALID_USER)
        res = client.post("/api/auth/login", json={
            "email": VALID_USER["email"],
            "password": VALID_USER["password"],
        })
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_login_wrong_password(self, client):
        client.post("/api/auth/register", json=VALID_USER)
        res = client.post("/api/auth/login", json={
            "email": VALID_USER["email"],
            "password": "wrongpassword",
        })
        assert res.status_code == 401

    def test_login_unknown_email(self, client):
        res = client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "whatever",
        })
        assert res.status_code == 401


# ─── /api/auth/me (protected) ────────────────────────────────────────────────

class TestGetMe:
    def test_me_returns_user_data(self, client):
        token = register_and_login(client, **VALID_USER)
        res = client.get("/api/auth/me", headers=auth_headers(token))
        assert res.status_code == 200
        body = res.json()
        assert body["email"] == VALID_USER["email"]
        assert body["username"] == VALID_USER["username"]
        assert "virtual_balance" in body
        assert float(body["virtual_balance"]) == 1_000_000.0

    def test_me_without_token_rejected(self, client):
        res = client.get("/api/auth/me")
        assert res.status_code == 401

    def test_me_with_invalid_token_rejected(self, client):
        res = client.get("/api/auth/me", headers={"Authorization": "Bearer fake.token.here"})
        assert res.status_code == 401
