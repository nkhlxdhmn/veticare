"""Password hashing and JWT helpers."""

import logging
from datetime import UTC, datetime, timedelta

import bcrypt as _bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """Hash a password with bcrypt; never store the original password."""
    return _bcrypt.hashpw(password.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    """Safely compare a candidate password to its stored bcrypt hash."""
    try:
        return _bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject: str) -> str:
    """Create a signed, short-lived JWT containing only the user subject."""
    settings = get_settings()
    expires_at = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    now = datetime.now(UTC)
    return jwt.encode(
        {"sub": subject, "exp": expires_at, "iat": now},
        settings.jwt_secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> str:
    """Validate a JWT and return its subject or raise JWTError."""
    settings = get_settings()
    payload = jwt.decode(token, settings.jwt_secret_key.get_secret_value(), algorithms=[settings.jwt_algorithm])
    subject = payload.get("sub")
    if not isinstance(subject, str):
        raise JWTError("Token has no subject")
    return subject
