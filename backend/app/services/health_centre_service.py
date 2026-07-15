"""Health Centre service layer."""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.health_centre_repository import HealthCentreRepository
from app.schemas.health_centre import HealthCentreCreate, HealthCentreUpdate, HealthCentreResponse


class HealthCentreService:
    """Service for managing Health Centres."""
    
    def __init__(self, clinic_repo: HealthCentreRepository = Depends()) -> None:
        self.clinic_repo = clinic_repo

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> list[HealthCentreResponse]:
        clinics = await self.clinic_repo.get_all(db, skip=skip, limit=limit)
        return [HealthCentreResponse.model_validate(clinic) for clinic in clinics]

    async def get_by_id(self, db: AsyncSession, id: UUID) -> HealthCentreResponse:
        clinic = await self.clinic_repo.get_by_id(db, id=id)
        if not clinic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Health Centre not found")
        return HealthCentreResponse.model_validate(clinic)

    async def create(self, db: AsyncSession, clinic_in: HealthCentreCreate) -> HealthCentreResponse:
        clinic = await self.clinic_repo.create(db, obj_in=clinic_in)
        return HealthCentreResponse.model_validate(clinic)

    async def update(self, db: AsyncSession, id: UUID, clinic_in: HealthCentreUpdate) -> HealthCentreResponse:
        clinic = await self.clinic_repo.get_by_id(db, id=id)
        if not clinic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Health Centre not found")
        
        updated_clinic = await self.clinic_repo.update(db, db_obj=clinic, obj_in=clinic_in)
        return HealthCentreResponse.model_validate(updated_clinic)

    async def delete(self, db: AsyncSession, id: UUID) -> None:
        clinic = await self.clinic_repo.get_by_id(db, id=id)
        if not clinic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Health Centre not found")
            
        await self.clinic_repo.delete(db, id=id)
