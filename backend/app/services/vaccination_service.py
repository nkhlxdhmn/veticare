"""
Service layer for vaccination-related business logic.
"""
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vaccination import Vaccination
from app.repositories.pet_repository import PetRepository
from app.repositories.vaccination_repository import VaccinationRepository
from app.schemas.vaccination import VaccinationCreate, VaccinationUpdate
from app.services.audit_service import AuditService

class VaccinationService:
    """
    Orchestrates vaccination logic, coordinating between the API layer
    and the data access layer.
    """
    def __init__(
        self,
        vaccination_repo: VaccinationRepository = Depends(),
        pet_repo: PetRepository = Depends(),
        audit_service: AuditService | None = None,
    ) -> None:
        self.vaccination_repo = vaccination_repo
        self.pet_repo = pet_repo
        self.audit_service = audit_service or AuditService()

    async def _validate_pet_ownership(self, db: AsyncSession, pet_id: UUID, owner_id: UUID):
        """Helper to check if the current user owns the pet."""
        pet = await self.pet_repo.get_by_id(db, pet_id=pet_id)
        if not pet or pet.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found or access denied")

    async def add_vaccination(
        self,
        db: AsyncSession,
        vaccination_in: VaccinationCreate,
        pet_id: UUID,
        owner_id: UUID,
        request: Request | None = None,
    ) -> Vaccination:
        """Add a new vaccination record for a pet after validating ownership."""
        await self._validate_pet_ownership(db, pet_id=pet_id, owner_id=owner_id)
        vaccination = await self.vaccination_repo.create(
            db,
            vaccination_in=vaccination_in,
            pet_id=pet_id,
        )
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="create",
                resource_type="vaccination",
                user_id=owner_id,
                resource_id=str(vaccination.id),
                metadata={"pet_id": str(pet_id)},
            )
        return vaccination

    async def get_vaccinations_for_pet(
        self,
        db: AsyncSession,
        pet_id: UUID,
        owner_id: UUID,
        skip: int,
        limit: int,
    ) -> list[Vaccination]:
        """Retrieve vaccination history for a pet after validating ownership."""
        await self._validate_pet_ownership(db, pet_id=pet_id, owner_id=owner_id)
        return await self.vaccination_repo.get_all_for_pet(db, pet_id=pet_id, skip=skip, limit=limit)

    async def get_upcoming_vaccinations(self, db: AsyncSession, owner_id: UUID) -> list[Vaccination]:
        """Retrieve all upcoming vaccinations for a user's pets."""
        return await self.vaccination_repo.get_upcoming_for_user(db, owner_id=owner_id, days=30)

    async def update_vaccination(
        self,
        db: AsyncSession,
        vaccination_id: UUID,
        vaccination_in: VaccinationUpdate,
        owner_id: UUID,
        request: Request | None = None,
    ) -> Vaccination:
        """Update a vaccination record after validating ownership."""
        vaccination = await self.vaccination_repo.get_by_id(db, vaccination_id=vaccination_id)
        if not vaccination:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccination record not found")
        await self._validate_pet_ownership(db, pet_id=vaccination.pet_id, owner_id=owner_id)
        updated_vaccination = await self.vaccination_repo.update(
            db,
            vaccination=vaccination,
            vaccination_in=vaccination_in,
        )
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="update",
                resource_type="vaccination",
                user_id=owner_id,
                resource_id=str(updated_vaccination.id),
                metadata={"pet_id": str(vaccination.pet_id)},
            )
        return updated_vaccination