import uuid
from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.pet import Pet

class MedicalRecord(Base, TimestampMixin):
    """
    SQLAlchemy Model for the 'medical_records' table.
    Represents a single veterinary visit or health event.
    """
    __tablename__ = "medical_records"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    pet_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    visit_date: Mapped[date] = mapped_column(Date, nullable=False)
    diagnosis: Mapped[str] = mapped_column(String(255), nullable=False)
    treatment: Mapped[Optional[str]] = mapped_column(Text)
    medicines: Mapped[Optional[str]] = mapped_column(Text, comment="List of prescribed medicines")
    doctor_name: Mapped[Optional[str]] = mapped_column(String(100))
    clinic_name: Mapped[Optional[str]] = mapped_column(String(150))
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    pet: Mapped["Pet"] = relationship("Pet", back_populates="medical_records")