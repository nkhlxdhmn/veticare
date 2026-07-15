"""Notification response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    """Serialized in-app notification."""

    id: UUID
    title: str
    message: str
    notification_type: str
    payload: dict | None
    is_read: bool
    read_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UnreadCountResponse(BaseModel):
    """Unread notification count response."""

    count: int
