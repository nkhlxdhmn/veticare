"""Rescue Request model definition."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.ngo import NGO
    from app.models.user import User
    from app.models.pet import Pet


class RescueRequest(Base, TimestampMixin):
    """Emergency rescue requests for animals in distress."""

    __tablename__ = "rescue_requests"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=__import__("uuid").uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ngo_id: Mapped[UUID | None] = mapped_column(ForeignKey("ngos.id", ondelete="SET NULL"), nullable=True)
    pet_id: Mapped[UUID | None] = mapped_column(ForeignKey("pets.id", ondelete="SET NULL"), nullable=True)

    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Location
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    
    priority: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Pending", nullable=False) # Pending, Accepted, Resolved, Cancelled
    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    ngo: Mapped["NGO"] = relationship(back_populates="rescue_requests")
    pet: Mapped["Pet"] = relationship("Pet", foreign_keys=[pet_id])
