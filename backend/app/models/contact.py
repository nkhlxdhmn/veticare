import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User

class Contact(Base, TimestampMixin):
    """
    SQLAlchemy Model for the 'contacts' table.
    """
    __tablename__ = "contacts"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), 
        nullable=True, 
        index=True
    )
    name: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )
    email: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    subject: Mapped[str] = mapped_column(
        String(150), 
        nullable=False
    )
    message: Mapped[str] = mapped_column(
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="OPEN",
        nullable=False
    )
    
    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User", 
        back_populates="contacts"
    )
