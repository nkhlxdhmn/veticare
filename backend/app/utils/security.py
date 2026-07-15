"""Password hashing and JWT helpers."""

import logging
from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

logger = logging.getLogger(__name__)

PASSWORD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Hash a password with bcrypt; never store the original password."""
    return PASSWORD_CONTEXT.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Safely compare a candidate password to its stored bcrypt hash."""
    return PASSWORD_CONTEXT.verify(password, hashed_password)


def create_access_token(subject: str) -> str:
    """Create a signed, short-lived JWT containing only the user subject."""
    settings = get_settings()
    expires_at = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    now = datetime.now(UTC)
    return jwt.encode(
        {"sub": subject, "exp": expires_at, "iat": now},
        settings.secret_key.get_secret_value(),
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> str:
    """Validate a JWT and return its subject or raise JWTError."""
    settings = get_settings()
    payload = jwt.decode(token, settings.secret_key.get_secret_value(), algorithms=[JWT_ALGORITHM])
    subject = payload.get("sub")
    if not isinstance(subject, str):
        raise JWTError("Token has no subject")
    return subject
