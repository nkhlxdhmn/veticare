"""Health Centre model definition."""

from datetime import time
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, Float, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.review import Review
    from app.models.veterinarian import Veterinarian


class HealthCentre(Base, TimestampMixin):
    """Veterinary Clinics and Hospitals."""

    __tablename__ = "health_centres"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=__import__("uuid").uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    
    # Location and Contact
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Details
    opening_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    closing_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    emergency_service: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    veterinarians: Mapped[list["Veterinarian"]] = relationship(back_populates="health_centre", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship(back_populates="health_centre", cascade="all, delete-orphan")
