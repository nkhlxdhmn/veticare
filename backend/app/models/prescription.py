"""Prescription model definition."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.medical_record import MedicalRecord


class Prescription(Base, TimestampMixin):
    """Prescription items linked to a medical record."""

    __tablename__ = "prescriptions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=__import__("uuid").uuid4)
    medical_record_id: Mapped[UUID] = mapped_column(ForeignKey("medical_records.id", ondelete="CASCADE"), nullable=False)
    
    medication_name: Mapped[str] = mapped_column(String(255), nullable=False)
    dosage: Mapped[str] = mapped_column(String(100), nullable=False)
    frequency: Mapped[str] = mapped_column(String(100), nullable=False)
    duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    medical_record: Mapped["MedicalRecord"] = relationship(back_populates="prescriptions")
