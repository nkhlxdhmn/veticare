import uuid
from datetime import date
from typing import List, Optional, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, ForeignKey, Date, Numeric, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
from app.models.medical_record import MedicalRecord
from app.models.prediction import Prediction
from app.models.vaccination import Vaccination

if TYPE_CHECKING:
    from app.models.user import User

class Pet(Base, TimestampMixin):
    """
    SQLAlchemy Model for the 'pets' table.
    """
    __tablename__ = "pets"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    name: Mapped[str] = mapped_column(
        String(50), 
        nullable=False
    )
    species: Mapped[str] = mapped_column(
        String(50), 
        nullable=False, 
        index=True
    )
    breed: Mapped[Optional[str]] = mapped_column(
        String(50), 
        nullable=True
    )
    gender: Mapped[str] = mapped_column(
        String(20),
        default="Unknown",
        nullable=False
    )
    weight: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=5, scale=2),
        nullable=True
    )
    date_of_birth: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True
    )
    image_url: Mapped[Optional[str]] = mapped_column(
        nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    
    # Relationships
    owner: Mapped["User"] = relationship(
        "User", 
        back_populates="pets"
    )
    vaccinations: Mapped[List["Vaccination"]] = relationship(
        "Vaccination", 
        back_populates="pet", 
        cascade="all, delete-orphan"
    )
    predictions: Mapped[List["Prediction"]] = relationship(
        "Prediction", 
        back_populates="pet", 
        cascade="all, delete-orphan"
    )
    medical_records: Mapped[List["MedicalRecord"]] = relationship(
        "MedicalRecord",
        back_populates="pet",
        cascade="all, delete-orphan",
    )
