"""Authentication HTTP endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.dependencies import CurrentUser, SupabaseClient
from app.schemas.auth import LoginRequest, ProfileResponse, RegisterRequest, TokenResponse
from app.services.auth import authenticate_profile, get_profile_by_email, register_profile
from app.utils.security import create_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, supabase: SupabaseClient) -> TokenResponse:
    """Register an account and return its first access token."""
    if get_profile_by_email(supabase, str(request.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")
    profile = register_profile(supabase, request)
    return TokenResponse(access_token=create_access_token(str(profile["id"])))


def issue_token(email: str, password: str, supabase) -> TokenResponse:
    """Authenticate a profile without revealing whether email or password failed."""
    profile = authenticate_profile(supabase, email, password)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(access_token=create_access_token(str(profile["id"])))


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, supabase: SupabaseClient) -> TokenResponse:
    """JSON login endpoint for browser and mobile clients."""
    return issue_token(str(request.email), request.password, supabase)


@router.post("/token", response_model=TokenResponse)
def oauth_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    supabase: SupabaseClient,
) -> TokenResponse:
    """OAuth2-compatible form login used by Swagger's Authorize button."""
    return issue_token(form_data.username, form_data.password, supabase)


@router.get("/me", response_model=ProfileResponse)
def read_current_user(current_user: CurrentUser) -> dict:
    """Return the currently authenticated profile."""
    return current_user
