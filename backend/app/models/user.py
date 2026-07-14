import uuid
from typing import List, Optional
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class User(Base, TimestampMixin):
    """
    SQLAlchemy Model for the 'users' table.
    """
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        nullable=False, 
        index=True
    )
    hashed_password: Mapped[str] = mapped_column(
        nullable=False
    )
    username: Mapped[str] = mapped_column(
        String(30), 
        unique=True, 
        nullable=False, 
        index=True
    )
    first_name: Mapped[Optional[str]] = mapped_column(
        String(50), 
        nullable=True
    )
    last_name: Mapped[Optional[str]] = mapped_column(
        String(50), 
        nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True, 
        nullable=False
    )
    
    # Relationships
    # ON DELETE CASCADE is handled by SQLAlchemy cascade configuration
    pets: Mapped[List["Pet"]] = relationship(
        "Pet",
        back_populates="owner", 
        cascade="all, delete-orphan"
    )
    contacts: Mapped[List["Contact"]] = relationship(
        "Contact",
        back_populates="user"
    )
