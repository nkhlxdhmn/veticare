"""Authentication business logic."""

import hashlib
import logging
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from supabase import Client

from app.schemas.auth import RegisterRequest
from app.utils.security import hash_password, verify_password

logger = logging.getLogger(__name__)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


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
        "is_active": False,
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


def request_password_reset(supabase: Client, email: str) -> None:
    """Always returns silently — never reveal whether an email exists."""
    profile = get_profile_by_email(supabase, email)
    if not profile:
        return
    raw_token = secrets.token_urlsafe(32)
    supabase.table("password_reset_tokens").insert({
        "profile_id": profile["id"],
        "token_hash": _hash_token(raw_token),
        "expires_at": (datetime.now(UTC) + timedelta(minutes=30)).isoformat(),
    }).execute()
    reset_link = f"https://veticare-seven.vercel.app/reset-password?token={raw_token}"
    logger.info(
        "Password reset link for %s: %s",
        email, reset_link,
    )


def reset_password(supabase: Client, token: str, new_password: str) -> bool:
    token_hash = _hash_token(token)
    result = (
        supabase.table("password_reset_tokens")
        .select("*")
        .eq("token_hash", token_hash)
        .eq("used", False)
        .execute()
    )
    if not result.data:
        return False
    row = result.data[0]
    if datetime.fromisoformat(row["expires_at"]) < datetime.now(UTC):
        return False
    supabase.table("profiles").update(
        {"hashed_password": hash_password(new_password)}
    ).eq("id", row["profile_id"]).execute()
    supabase.table("password_reset_tokens").update({"used": True}).eq("id", row["id"]).execute()
    return True


def generate_and_send_otp(supabase: Client, profile_id: str, email: str) -> None:
    otp = f"{secrets.randbelow(1_000_000):06d}"
    supabase.table("email_otps").insert({
        "profile_id": profile_id,
        "otp_hash": _hash_token(otp),
        "expires_at": (datetime.now(UTC) + timedelta(minutes=10)).isoformat(),
    }).execute()
    logger.info("OTP for %s (profile %s): %s", email, profile_id, otp)


def verify_otp(supabase: Client, profile_id: str, otp: str) -> bool:
    result = (
        supabase.table("email_otps")
        .select("*")
        .eq("profile_id", profile_id)
        .eq("used", False)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        return False
    row = result.data[0]
    if row["otp_hash"] != _hash_token(otp) or datetime.fromisoformat(row["expires_at"]) < datetime.now(UTC):
        return False
    supabase.table("email_otps").update({"used": True}).eq("id", row["id"]).execute()
    supabase.table("profiles").update({"is_active": True}).eq("id", profile_id).execute()
    return True
