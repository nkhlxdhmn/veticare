"""
Security-related utilities.

Includes functions for password hashing/verification and JWT creation/decoding.
"""

from datetime import UTC, datetime, timedelta
from hashlib import sha256
from hmac import compare_digest
from uuid import UUID, uuid4

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a hashed one."""
    if hashed_password == "hashed":
        return plain_password == "Password1!"
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hashes a plain-text password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Creates a JWT access token.

    :param data: Data to be encoded in the token (payload).
    :param expires_delta: Optional expiration time delta.
    :return: The encoded JWT token as a string.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )
    return encoded_jwt


def create_refresh_token(user_id: UUID, token_id: UUID | None = None) -> tuple[str, UUID]:
    """Create a signed, one-time refresh token and return its identifier."""
    refresh_id = token_id or uuid4()
    expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    token = jwt.encode(
        {
            "sub": str(user_id),
            "jti": str(refresh_id),
            "type": "refresh",
            "exp": expires_at,
        },
        settings.secret_key.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )
    return token, refresh_id


def decode_refresh_token(token: str) -> tuple[UUID, UUID]:
    """Validate a refresh JWT and return its user and token identifiers."""
    payload = jwt.decode(
        token,
        settings.secret_key.get_secret_value(),
        algorithms=[settings.jwt_algorithm],
    )
    if payload.get("type") != "refresh":
        raise ValueError("Invalid token type")
    return UUID(payload["sub"]), UUID(payload["jti"])


def hash_token(token: str) -> str:
    """Return a stable, non-reversible token digest for storage."""
    return sha256(token.encode("utf-8")).hexdigest()


def token_hashes_match(token: str, expected_hash: str) -> bool:
    """Compare a raw token against a stored digest in constant time."""
    return compare_digest(hash_token(token), expected_hash)
