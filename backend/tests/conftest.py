"""
Shared fixtures for backend integration tests.

Strategy:
- Set DATABASE_URL=sqlite:// BEFORE any app.* imports so SQLAlchemy uses
  in-memory SQLite instead of PostgreSQL (no psycopg2 / no running DB needed).
- Mock redis_client so tests never need a real Redis server.
- Patch Base.metadata.create_all in the app lifespan so it doesn't re-run
  during TestClient startup; we create tables ourselves first.
"""
import os
import sys
from unittest.mock import MagicMock

# ── Must be set BEFORE any app.* import ──────────────────────────────────────
# pydantic-settings reads env vars at class instantiation time
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("SECRET_KEY", "test-secret-key-32-bytes-long-xxx")

# Stub out heavy optional deps not installed locally (only run inside Docker)
sys.modules.setdefault("anthropic", MagicMock())

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# ── in-memory SQLite engine shared across all tests in a session ──────────────
SQLITE_URL = "sqlite://"
test_engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def _mock_redis() -> MagicMock:
    m = MagicMock()
    m.get.return_value = None       # cache miss by default
    m.setex.return_value = True
    m.delete.return_value = 1
    return m


@pytest.fixture()
def client():
    """
    Yields a starlette TestClient wired to:
      - SQLite in-memory DB (all tables created fresh, dropped after test)
      - Mocked Redis (no real server needed)
    """
    # Import app FIRST — this triggers all model class imports which register
    # tables with Base.metadata.  create_all must run after this.
    from app.main import app
    from app.core.database import Base, get_db

    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    mock_redis = _mock_redis()

    app.dependency_overrides[get_db] = override_get_db

    # Patch create_all in lifespan (would otherwise hit PostgreSQL)
    # and redis_client everywhere it's used
    with patch("app.core.database.Base.metadata.create_all"), \
         patch("app.services.market.redis_client", mock_redis), \
         patch("app.core.redis_client.redis_client", mock_redis):
        with TestClient(app, raise_server_exceptions=True) as c:
            yield c

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


# ── helpers ───────────────────────────────────────────────────────────────────

def register_and_login(client: TestClient, email="user@test.com", username="testuser", password="password123"):
    """Register a user and return their JWT token."""
    client.post("/api/auth/register", json={"email": email, "username": username, "password": password})
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
