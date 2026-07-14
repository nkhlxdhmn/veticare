import uuid
from typing import TYPE_CHECKING, Any
from sqlalchemy import String, Boolean, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.pet import Pet

class Prediction(Base, TimestampMixin):
    """
    SQLAlchemy Model for the 'predictions' table.
    """
    __tablename__ = "predictions"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    pet_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    # JSONB symptoms column supporting flexible schema layouts (e.g. lists, key-values, nested objects)
    symptoms: Mapped[Any] = mapped_column(
        JSONB, 
        nullable=False
    )
    predicted_disease: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )
    confidence: Mapped[float] = mapped_column(
        Float, 
        nullable=False
    )
    dangerous: Mapped[bool] = mapped_column(
        Boolean, 
        default=False, 
        nullable=False
    )
    model_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    processing_time_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    
    # Relationships
    pet: Mapped["Pet"] = relationship(
        "Pet", 
        back_populates="predictions"
    )
