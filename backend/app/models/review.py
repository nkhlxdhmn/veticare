"""Review model definition."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import CheckConstraint, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.health_centre import HealthCentre
    from app.models.user import User


class Review(Base, TimestampMixin):
    """Reviews left by users for Health Centres."""

    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=__import__("uuid").uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    health_centre_id: Mapped[UUID | None] = mapped_column(ForeignKey("health_centres.id", ondelete="CASCADE"), nullable=True)
    
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    review: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    author: Mapped["User"] = relationship(back_populates="reviews")
    health_centre: Mapped["HealthCentre"] = relationship(back_populates="reviews")
