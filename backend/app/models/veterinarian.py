"""Veterinarian model definition."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.appointment import Appointment
    from app.models.doctor_availability import DoctorAvailability
    from app.models.health_centre import HealthCentre


class Veterinarian(Base, TimestampMixin):
    """Veterinarian profiles linked to a health centre."""

    __tablename__ = "veterinarians"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=__import__("uuid").uuid4)
    health_centre_id: Mapped[UUID] = mapped_column(ForeignKey("health_centres.id", ondelete="CASCADE"), nullable=False)
    
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialization: Mapped[str] = mapped_column(String(100), nullable=False, default="General Practice")
    qualification: Mapped[str | None] = mapped_column(String(255), nullable=True)
    experience: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    consultation_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    health_centre: Mapped["HealthCentre"] = relationship(back_populates="veterinarians")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="doctor", cascade="all, delete-orphan")
    availabilities: Mapped[list["DoctorAvailability"]] = relationship(back_populates="veterinarian", cascade="all, delete-orphan")
