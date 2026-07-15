"""Medical Record ORM model."""

from datetime import date
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.pet import Pet


class MedicalRecord(Base, TimestampMixin):
    """Medical record history for a pet."""

    __tablename__ = "medical_records"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=__import__("uuid").uuid4)
    pet_id: Mapped[UUID] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), index=True)
    veterinarian_id: Mapped[UUID | None] = mapped_column(ForeignKey("veterinarians.id", ondelete="SET NULL"), nullable=True)
    appointment_id: Mapped[UUID | None] = mapped_column(ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)

    visit_date: Mapped[date] = mapped_column(Date, nullable=False)
    diagnosis: Mapped[str] = mapped_column(String(255), nullable=False)
    treatment: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    prescription: Mapped[str | None] = mapped_column(Text, nullable=True)
    medicines: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    next_visit: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    pet: Mapped["Pet"] = relationship("Pet", back_populates="medical_records")