"""Reusable FastAPI dependencies for API routes."""

import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models import Profile
from app.utils.security import decode_access_token

SettingsDependency = Annotated[Settings, Depends(get_settings)]
DatabaseSession = Annotated[Session, Depends(get_db)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: DatabaseSession) -> Profile:
    """Resolve a validated bearer token to its active profile."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        profile_id = uuid.UUID(decode_access_token(token))
    except (JWTError, ValueError):
        raise credentials_error
    profile = session.get(Profile, profile_id)
    if not profile or not profile.is_active:
        raise credentials_error
    return profile


CurrentUser = Annotated[Profile, Depends(get_current_user)]
