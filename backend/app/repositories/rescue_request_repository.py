"""Rescue request repository for database operations."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.rescue_request import RescueRequest
from app.repositories.base import BaseRepository
from app.schemas.rescue_request import RescueRequestCreate, RescueRequestUpdate


class RescueRequestRepository(BaseRepository[RescueRequest, RescueRequestCreate, RescueRequestUpdate]):
    """Repository for Rescue Request database operations."""
    
    def __init__(self):
        super().__init__(RescueRequest)

    async def get_all_for_owner(self, db: AsyncSession, *, owner_id: UUID) -> list[RescueRequest]:
        """Get all rescue requests made by a specific pet owner."""
        statement = select(RescueRequest).where(RescueRequest.pet_owner_id == owner_id).options(selectinload(RescueRequest.ngo))
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def get_all_for_ngo(self, db: AsyncSession, *, ngo_id: UUID) -> list[RescueRequest]:
        """Get all rescue requests assigned to a specific NGO."""
        statement = select(RescueRequest).where(RescueRequest.ngo_id == ngo_id).options(selectinload(RescueRequest.pet_owner))
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def get_pending_requests(self, db: AsyncSession, limit: int = 100, skip: int = 0) -> list[RescueRequest]:
        """Get all unassigned pending rescue requests for NGOs to view."""
        statement = select(RescueRequest).where(RescueRequest.status == "PENDING", RescueRequest.ngo_id.is_(None)).offset(skip).limit(limit).options(selectinload(RescueRequest.pet_owner))
        result = await db.execute(statement)
        return list(result.scalars().all())
