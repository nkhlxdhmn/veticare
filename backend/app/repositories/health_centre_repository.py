"""Health Centre repository for database operations."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.health_centre import HealthCentre
from app.repositories.base import BaseRepository
from app.schemas.health_centre import HealthCentreCreate, HealthCentreUpdate


class HealthCentreRepository(BaseRepository[HealthCentre, HealthCentreCreate, HealthCentreUpdate]):
    """Repository for Health Centre database operations."""
    
    def __init__(self):
        super().__init__(HealthCentre)

    async def get_by_id(self, db: AsyncSession, id: UUID) -> HealthCentre | None:
        query = select(HealthCentre).options(
            selectinload(HealthCentre.veterinarians),
            selectinload(HealthCentre.reviews)
        ).where(HealthCentre.id == id)
        result = await db.execute(query)
        return result.scalar_one_or_none()
