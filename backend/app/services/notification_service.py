"""Business operations for in-app notifications."""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository


class NotificationService:
    """Coordinate user notification retrieval and read-state updates."""

    def __init__(self, repository: NotificationRepository | None = None) -> None:
        self.repository = repository or NotificationRepository()

    async def list_for_user(
        self, db: AsyncSession, user_id: UUID, limit: int
    ) -> list[Notification]:
        """Return recent user notifications."""
        return await self.repository.list_for_user(db, user_id, limit)

    async def unread_count(self, db: AsyncSession, user_id: UUID) -> int:
        """Return unread notification total."""
        return await self.repository.unread_count(db, user_id)

    async def mark_read(
        self, db: AsyncSession, notification_id: UUID, user_id: UUID
    ) -> Notification | None:
        """Mark one notification as read if owned by the current user."""
        return await self.repository.mark_read(db, notification_id, user_id)
