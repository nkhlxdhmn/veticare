"""Profile business logic."""

import uuid

from supabase import Client

from app.schemas.profile import ProfileUpdate


def get_profile(supabase: Client, profile_id: uuid.UUID) -> dict | None:
    """Fetch a profile by primary key."""
    result = supabase.table("profiles").select("*").eq("id", str(profile_id)).execute()
    return result.data[0] if result.data else None


def update_profile(supabase: Client, profile_id: uuid.UUID, data: ProfileUpdate) -> dict | None:
    """Apply partial updates to a profile and persist."""
    payload = data.model_dump(exclude_unset=True)
    result = supabase.table("profiles").update(payload).eq("id", str(profile_id)).execute()
    return result.data[0] if result.data else None
