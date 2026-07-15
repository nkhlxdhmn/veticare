"""SQLAlchemy engine, session, and declarative model base."""

import logging
from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Base class inherited by every ORM model."""


@lru_cache
def get_engine() -> Engine:
    """Create one process-wide, pooled PostgreSQL engine."""
    database_url = get_settings().database_url
    if not database_url:
        raise RuntimeError("VETICARE_DATABASE_URL must be configured")
    return create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_recycle=1_800,
    )


@lru_cache
def get_session_factory() -> sessionmaker[Session]:
    """Return a session factory bound to the configured engine."""
    return sessionmaker(bind=get_engine(), autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    """Yield one transaction-aware session per request and always close it."""
    session = get_session_factory()()
    try:
        yield session
    except Exception:
        logger.exception("Session error — rolling back")
        session.rollback()
        raise
    finally:
        session.close()
