from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# pool_pre_ping detects stale connections after DB restarts.
# pool_size / max_overflow / pool_timeout are PostgreSQL-specific;
# skip them for SQLite (used in tests) which manages its own pool.
_engine_kwargs: dict = {"pool_pre_ping": True}
if not settings.DATABASE_URL.startswith("sqlite"):
    _engine_kwargs.update(
        {
            "pool_size": 5,
            "max_overflow": 10,
            "pool_timeout": 30,
        }
    )

engine = create_engine(settings.DATABASE_URL, **_engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
