"""Authentication routes for registration, login, refresh, and logout."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_auth_service, get_current_user, get_db, get_notification_service
from app.models.user import User
from app.schemas.auth import RefreshTokenRequest, TokenPairResponse
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService
from app.services.notification_service import NotificationService

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


@router.get("/notifications", response_model=list[NotificationResponse])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """List recent in-app notifications for the current user."""
    notifications = await notification_service.list_for_user(
        db=db,
        user_id=current_user.id,
        limit=20,
    )
    return [
        {
            "id": str(notification.id),
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "payload": notification.payload,
            "is_read": notification.is_read,
            "read_at": notification.read_at,
            "created_at": notification.created_at,
        }
        for notification in notifications
    ]


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Mark a notification as read for the current user."""
    notification_uuid = UUID(notification_id)
    notification = await notification_service.mark_read(
        db=db,
        notification_id=notification_uuid,
        user_id=current_user.id,
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return {"message": "Notification marked as read"}


@router.get("/notifications/unread-count", response_model=UnreadCountResponse)
async def unread_notification_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Return the number of unread in-app notifications."""
    count = await notification_service.unread_count(db=db, user_id=current_user.id)
    return {"count": count}