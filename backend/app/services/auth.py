"""Authentication business logic."""

import logging
import uuid

from fastapi import HTTPException, status
from supabase import Client

from app.schemas.auth import RegisterRequest
from app.utils.security import hash_password, verify_password

logger = logging.getLogger(__name__)


def get_profile_by_email(supabase: Client, email: str) -> dict | None:
    """Find a profile by normalized email address."""
    logger.info("Supabase query: profiles.select(*).eq(email=%s)", email.lower())
    try:
        result = supabase.table("profiles").select("*").eq("email", email.lower()).execute()
        logger.info("Supabase result: %d rows returned", len(result.data))
        if result.data:
            logger.info("Supabase profile found: id=%s", result.data[0].get("id"))
        return result.data[0] if result.data else None
    except Exception:
        logger.exception("Supabase SELECT failed for email=%s", email)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database query failed — check Render logs for details",
        )


def register_profile(supabase: Client, request: RegisterRequest) -> dict:
    """Create and persist a new profile after uniqueness validation."""
    profile_id = str(uuid.uuid4())
    data = {
        "id": profile_id,
        "email": str(request.email).lower(),
        "hashed_password": hash_password(request.password),
        "full_name": request.full_name.strip(),
        "phone": request.phone,
    }
    logger.info("Supabase INSERT: profiles table, id=%s, email=%s", profile_id, request.email)
    try:
        result = supabase.table("profiles").insert(data).execute()
        logger.info("Supabase INSERT result: %d rows", len(result.data))
        return result.data[0]
    except Exception:
        logger.exception("Supabase INSERT failed for email=%s", request.email)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database write failed — check that VETICARE_SUPABASE_KEY is the service_role key, "
            "or that RLS policies allow INSERT on the profiles table",
        )


def authenticate_profile(supabase: Client, email: str, password: str) -> dict | None:
    """Return an active profile only when its credentials are valid."""
    logger.info("Authenticating profile: email=%s", email)
    profile = get_profile_by_email(supabase, email)
    if not profile:
        logger.info("No profile found for email=%s", email)
        return None
    if not profile.get("is_active", False):
        logger.info("Profile is inactive: email=%s", email)
        return None
    logger.info("Verifying password for email=%s", email)
    if not verify_password(password, profile["hashed_password"]):
        logger.info("Password mismatch for email=%s", email)
        return None
    logger.info("Authentication successful: email=%s, id=%s", email, profile.get("id"))
    return profile
