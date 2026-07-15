"""Profile HTTP endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.api.dependencies import CurrentUser, DatabaseSession
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.profile import get_profile, update_profile

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileResponse)
def read_profile(current_user: CurrentUser) -> ProfileResponse:
    """Return the authenticated user's full profile."""
    return current_user


@router.patch("/me", response_model=ProfileResponse)
def patch_profile(body: ProfileUpdate, current_user: CurrentUser, session: DatabaseSession) -> ProfileResponse:
    """Update the authenticated user's profile fields."""
    return update_profile(session, current_user, body)
