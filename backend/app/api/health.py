from fastapi import APIRouter
from sqlalchemy import text
from app.core.database import SessionLocal
from app.core.redis_client import redis_client

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health_check():
    db_status = "disconnected"
    redis_status = "disconnected"

    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception:
        pass

    try:
        redis_client.ping()
        redis_status = "connected"
    except Exception:
        pass

    return {"status": "ok", "database": db_status, "redis": redis_status}
