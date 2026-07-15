"""Async SQLAlchemy engine and session dependency infrastructure."""

from collections.abc import AsyncGenerator
from functools import lru_cache

from app.core.config import settings
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)


@lru_cache
def get_engine() -> AsyncEngine:
    """Build the database engine lazily, so HTTP-only startup needs no database."""
    return create_async_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield one transactional database session per request."""
    session_factory = async_sessionmaker(
        get_engine(), class_=AsyncSession, expire_on_commit=False
    )
    async with session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


get_db = get_session
