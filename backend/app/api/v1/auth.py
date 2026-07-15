"""Authentication routes for registration, login, refresh, logout, and profile."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_auth_service, get_current_user, get_db
from app.models.user import User
from app.schemas.auth import RefreshTokenRequest, TokenPairResponse
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Register a new user."""
    await auth_service.register_user(user_in=user_in, db=db, request=request)
    return {"message": "User registered successfully"}


@router.post("/login", response_model=TokenPairResponse)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Login to get an access token and a refresh token."""
    access_token, refresh_token = await auth_service.login_user(
        email=form_data.username,
        password=form_data.password,
        db=db,
        request=request,
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=TokenPairResponse)
async def refresh(
    request: Request,
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Rotate the current refresh token to issue a new token pair."""
    access_token, refresh_token = await auth_service.refresh_access_token(
        db=db,
        refresh_token_value=payload.refresh_token,
        request=request,
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/logout")
async def logout(
    request: Request,
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Revoke all refresh sessions for the current user."""
    await auth_service.logout_user(db=db, user_id=current_user.id, request=request)
    await auth_service.revoke_refresh_token(
        db=db,
        refresh_token_value=payload.refresh_token,
        request=request,
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current authenticated user's profile."""
    update_data = user_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user