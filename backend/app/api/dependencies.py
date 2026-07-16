"""Reusable FastAPI dependencies for API routes."""

import logging
import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from supabase import Client

from app.core.config import Settings, get_settings
from app.core.supabase import get_supabase_client
from app.utils.security import decode_access_token

logger = logging.getLogger(__name__)

SettingsDependency = Annotated[Settings, Depends(get_settings)]
SupabaseClient = Annotated[Client, Depends(get_supabase_client)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], supabase: SupabaseClient) -> dict:
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
    try:
        result = supabase.table("profiles").select("*").eq("id", str(profile_id)).execute()
        if not result.data:
            raise credentials_error
        profile = result.data[0]
        if not profile.get("is_active", False):
            raise credentials_error
        return profile
    except HTTPException:
        raise
    except Exception:
        logger.exception("Supabase query failed in get_current_user for profile_id=%s", profile_id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database query failed",
        )


CurrentUser = Annotated[dict, Depends(get_current_user)]
