"""NGO model definition."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.ngo_service import NGOService
    from app.models.rescue_request import RescueRequest


class NGO(Base, TimestampMixin):
    """Animal Welfare Organizations and Rescue Shelters."""

    __tablename__ = "ngos"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=__import__("uuid").uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    registration_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Location and Contact
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Relationships
    rescue_requests: Mapped[list["RescueRequest"]] = relationship(back_populates="ngo", cascade="all, delete-orphan")
    ngo_services: Mapped[list["NGOService"]] = relationship(back_populates="ngo", cascade="all, delete-orphan")
