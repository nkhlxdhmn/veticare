"""Doctor Availability model definition."""

from datetime import time
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Integer, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.veterinarian import Veterinarian


class DoctorAvailability(Base):
    """Specific working hours/availability slots for a veterinarian."""

    __tablename__ = "doctor_availability"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=__import__("uuid").uuid4)
    veterinarian_id: Mapped[UUID] = mapped_column(ForeignKey("veterinarians.id", ondelete="CASCADE"), nullable=False)
    
    # 0 = Monday, 6 = Sunday
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    veterinarian: Mapped["Veterinarian"] = relationship(back_populates="availabilities")
