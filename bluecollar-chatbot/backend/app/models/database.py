"""
Async SQLAlchemy engine + session factory.
Uses SQLite locally (no setup needed), PostgreSQL in production.
"""
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from .db_models import Base

# Auto-detect: use SQLite locally if no PostgreSQL URL is set
_pg_url = os.getenv("DATABASE_URL", "")
if _pg_url.startswith("postgresql"):
    DATABASE_URL = _pg_url.replace("postgresql://", "postgresql+asyncpg://", 1) \
        if "asyncpg" not in _pg_url else _pg_url
else:
    # SQLite — works with zero setup, stored in backend/chatbot.db
    DATABASE_URL = "sqlite+aiosqlite:///./chatbot.db"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    # SQLite needs this for async
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def create_tables():
    """Create all tables — used on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
