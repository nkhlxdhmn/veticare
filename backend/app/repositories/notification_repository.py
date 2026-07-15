"""Database access for in-app notifications."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


class NotificationRepository:
    """Own notification queries and read-state changes."""

    async def list_for_user(
        self, db: AsyncSession, user_id: UUID, limit: int
    ) -> list[Notification]:
        """List newest notifications for one user."""
        result = await db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars())

    async def unread_count(self, db: AsyncSession, user_id: UUID) -> int:
        """Count unread notifications for one user."""
        result = await db.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == user_id, Notification.is_read.is_(False)
            )
        )
        return int(result.scalar_one())

    async def mark_read(
        self, db: AsyncSession, notification_id: UUID, user_id: UUID
    ) -> Notification | None:
        """Mark a user-owned notification as read."""
        result = await db.execute(
            select(Notification).where(
                Notification.id == notification_id, Notification.user_id == user_id
            )
        )
        notification = result.scalar_one_or_none()
        if notification:
            notification.is_read = True
            notification.read_at = datetime.now(UTC)
            await db.flush()
        return notification
