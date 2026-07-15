"""NGO repository for database operations."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ngo import NGO
from app.repositories.base import BaseRepository
from app.schemas.ngo import NGOCreate, NGOUpdate


class NGORepository(BaseRepository[NGO, NGOCreate, NGOUpdate]):
    """Repository for NGO database operations."""
    
    def __init__(self):
        super().__init__(NGO)

    async def get_by_id(self, db: AsyncSession, id: UUID) -> NGO | None:
        query = select(NGO).options(
            selectinload(NGO.ngo_services),
            selectinload(NGO.rescue_requests)
        ).where(NGO.id == id)
        result = await db.execute(query)
        return result.scalar_one_or_none()
