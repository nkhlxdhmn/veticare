"""Authentication business logic."""

import uuid

from supabase import Client

from app.schemas.auth import RegisterRequest
from app.utils.security import hash_password, verify_password


def get_profile_by_email(supabase: Client, email: str) -> dict | None:
    """Find a profile by normalized email address."""
    result = supabase.table("profiles").select("*").eq("email", email.lower()).execute()
    return result.data[0] if result.data else None


def register_profile(supabase: Client, request: RegisterRequest) -> dict:
    """Create and persist a new profile after uniqueness validation."""
    data = {
        "id": str(uuid.uuid4()),
        "email": str(request.email).lower(),
        "hashed_password": hash_password(request.password),
        "full_name": request.full_name.strip(),
        "phone": request.phone,
    }
    result = supabase.table("profiles").insert(data).execute()
    return result.data[0]


def authenticate_profile(supabase: Client, email: str, password: str) -> dict | None:
    """Return an active profile only when its credentials are valid."""
    profile = get_profile_by_email(supabase, email)
    if not profile or not profile.get("is_active", False) or not verify_password(password, profile["hashed_password"]):
        return None
    return profile
