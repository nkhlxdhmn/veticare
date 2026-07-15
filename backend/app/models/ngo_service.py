"""NGO Service model definition."""

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.ngo import NGO


class NGOService(Base):
    """Specific services provided by an NGO."""

    __tablename__ = "ngo_services"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ngo_id: Mapped[UUID] = mapped_column(ForeignKey("ngos.id", ondelete="CASCADE"), nullable=False)
    
    service_name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    ngo: Mapped["NGO"] = relationship(back_populates="ngo_services")
