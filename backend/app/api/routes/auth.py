"""Authentication HTTP endpoints."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Profile
from app.schemas.auth import LoginRequest, ProfileResponse, RegisterRequest, TokenResponse
from app.services.auth import authenticate_profile, get_profile_by_email, register_profile
from app.utils.security import create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["authentication"])
DatabaseSession = Annotated[Session, Depends(get_db)]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: DatabaseSession) -> Profile:
    """Resolve a validated bearer token to its active profile."""
    credentials_error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        profile_id = uuid.UUID(decode_access_token(token))
    except (JWTError, ValueError):
        raise credentials_error
    profile = session.get(Profile, profile_id)
    if not profile or not profile.is_active:
        raise credentials_error
    return profile


CurrentUser = Annotated[Profile, Depends(get_current_user)]


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, session: DatabaseSession) -> TokenResponse:
    """Register an account and return its first access token."""
    if get_profile_by_email(session, str(request.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")
    profile = register_profile(session, request)
    return TokenResponse(access_token=create_access_token(str(profile.id)))


def issue_token(email: str, password: str, session: Session) -> TokenResponse:
    """Authenticate a profile without revealing whether email or password failed."""
    profile = authenticate_profile(session, email, password)
    if not profile:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    return TokenResponse(access_token=create_access_token(str(profile.id)))


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, session: DatabaseSession) -> TokenResponse:
    """JSON login endpoint for browser and mobile clients."""
    return issue_token(str(request.email), request.password, session)


@router.post("/token", response_model=TokenResponse)
def oauth_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: DatabaseSession) -> TokenResponse:
    """OAuth2-compatible form login used by Swagger's Authorize button."""
    return issue_token(form_data.username, form_data.password, session)


@router.get("/me", response_model=ProfileResponse)
def read_current_user(current_user: CurrentUser) -> Profile:
    """Return the currently authenticated profile."""
    return current_user
