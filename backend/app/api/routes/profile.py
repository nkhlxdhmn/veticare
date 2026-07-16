"""Profile HTTP endpoints."""

from fastapi import APIRouter

from app.api.dependencies import CurrentUser, SupabaseClient
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.profile import update_profile

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileResponse)
def read_profile(current_user: CurrentUser) -> dict:
    """Return the authenticated user's full profile."""
    return current_user


@router.patch("/me", response_model=ProfileResponse)
def patch_profile(body: ProfileUpdate, current_user: CurrentUser, supabase: SupabaseClient) -> dict:
    """Update the authenticated user's profile fields."""
    result = update_profile(supabase, current_user["id"], body)
    return result or current_user
