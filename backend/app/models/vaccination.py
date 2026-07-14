import uuid
from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Date, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.pet import Pet

class Vaccination(Base, TimestampMixin):
    """
    SQLAlchemy Model for the 'vaccinations' table.
    """
    __tablename__ = "vaccinations"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    pet_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    vaccine_name: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )
    date_administered: Mapped[date] = mapped_column(
        Date, 
        nullable=False
    )
    next_due_date: Mapped[Optional[date]] = mapped_column(
        Date, 
        nullable=True, 
        index=True
    )
    clinic_name: Mapped[Optional[str]] = mapped_column(
        String(150), 
        nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    # Relationships
    pet: Mapped["Pet"] = relationship(
        "Pet", 
        back_populates="vaccinations"
    )
