"""API endpoints for user notifications."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, get_notification_service
from app.models.user import User
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.services.notification_service import NotificationService

router = APIRouter()


@router.get("/", response_model=list[NotificationResponse])
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


@router.post("/{notification_id}/read")
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


@router.get("/unread-count", response_model=UnreadCountResponse)
async def unread_notification_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Return the number of unread in-app notifications."""
    count = await notification_service.unread_count(db=db, user_id=current_user.id)
    return {"count": count}
