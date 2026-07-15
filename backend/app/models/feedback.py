"""Feedback model definition."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Feedback(Base, TimestampMixin):
    """Platform feedback submitted by users."""

    __tablename__ = "feedback"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=__import__("uuid").uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    category: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. 'Bug', 'Feature', 'General'
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Pending", nullable=False) # 'Pending', 'Reviewed', 'Resolved'

    # Relationships
    user: Mapped["User"] = relationship(back_populates="feedback_submissions")
