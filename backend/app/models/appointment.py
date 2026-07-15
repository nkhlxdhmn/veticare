"""Appointment ORM model."""

import uuid
from datetime import date, time

from sqlalchemy import Date, ForeignKey, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Appointment(Base, TimestampMixin):
    """Appointment scheduling model."""

    __tablename__ = "appointments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    pet_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), index=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    veterinarian_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("veterinarians.id", ondelete="SET NULL"), nullable=True)
    
    appointment_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    appointment_time: Mapped[time] = mapped_column(Time, nullable=False)
    
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="scheduled") # scheduled, confirmed, completed, cancelled
    notes: Mapped[str | None] = mapped_column(Text)

    pet = relationship("Pet", lazy="joined")
    owner = relationship("User", lazy="joined", foreign_keys=[owner_id])
    doctor = relationship("Veterinarian", lazy="joined", foreign_keys=[veterinarian_id])
