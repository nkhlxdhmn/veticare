"""Authentication HTTP endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from pydantic import BaseModel, EmailStr, Field

from app.api.dependencies import CurrentUser, SupabaseClient
from app.schemas.auth import LoginRequest, ProfileResponse, RegisterRequest, TokenResponse
from app.services.auth import authenticate_profile, get_profile_by_email, register_profile
from app.utils.security import create_access_token, create_refresh_token, decode_refresh_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, supabase: SupabaseClient) -> TokenResponse:
    """Register an account and return its first access token."""
    if get_profile_by_email(supabase, str(request.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")
    profile = register_profile(supabase, request)
    profile_id = str(profile["id"])
    from app.services.auth import generate_and_send_otp
    generate_and_send_otp(supabase, profile_id, str(request.email))
    return TokenResponse(
        access_token=create_access_token(profile_id),
        refresh_token=create_refresh_token(profile_id),
    )


def issue_token(email: str, password: str, supabase) -> TokenResponse:
    """Authenticate a profile without revealing whether email or password failed."""
    profile = authenticate_profile(supabase, email, password)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(
        access_token=create_access_token(str(profile["id"])),
        refresh_token=create_refresh_token(str(profile["id"])),
    )


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


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshRequest, supabase: SupabaseClient) -> TokenResponse:
    """Exchange a valid refresh token for a new access token (rotation)."""
    try:
        profile_id = decode_refresh_token(payload.refresh_token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    return TokenResponse(
        access_token=create_access_token(profile_id),
        refresh_token=create_refresh_token(profile_id),
    )


@router.post("/forgot-password", status_code=204)
def forgot_password(payload: ForgotPasswordRequest, supabase: SupabaseClient):
    """Request a password reset email."""
    from app.services.auth import request_password_reset, generate_and_send_otp
    request_password_reset(supabase, payload.email)
    return


@router.post("/reset-password", status_code=204)
def reset_password_route(payload: ResetPasswordRequest, supabase: SupabaseClient):
    """Reset password using a token from the reset email."""
    from app.services.auth import reset_password
    ok = reset_password(supabase, payload.token, payload.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")


@router.post("/verify-otp", status_code=204)
def verify_otp_route(payload: VerifyOtpRequest, supabase: SupabaseClient):
    """Verify an email OTP code and activate the profile."""
    from app.services.auth import get_profile_by_email, verify_otp
    profile = get_profile_by_email(supabase, payload.email)
    if not profile:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    if not verify_otp(supabase, profile["id"], payload.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired code")
