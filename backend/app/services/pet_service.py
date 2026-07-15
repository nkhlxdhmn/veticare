"""
Service layer for pet-related business logic.
"""
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pet import Pet
from app.repositories.pet_repository import PetRepository
from app.schemas.pet import PetCreate, PetUpdate
from app.services.audit_service import AuditService

class PetService:
    """Orchestrate pet-related logic and audit events."""

    def __init__(
        self,
        pet_repo: PetRepository = Depends(),
        audit_service: AuditService | None = None,
    ) -> None:
        self.pet_repo = pet_repo
        self.audit_service = audit_service or AuditService()

    async def get_pet_by_id(self, db: AsyncSession, pet_id: UUID, owner_id: UUID) -> Pet:
        """Retrieve a pet by ID and verify ownership."""
        pet = await self.pet_repo.get_by_id(db, pet_id=pet_id)
        if not pet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
        if pet.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this pet")
        return pet

    async def get_all_pets_for_owner(
        self,
        db: AsyncSession,
        owner_id: UUID,
        species: Optional[str],
        breed: Optional[str],
        skip: int,
        limit: int,
    ) -> list[Pet]:
        """Retrieve all pets for the current user with filtering and pagination."""
        return await self.pet_repo.get_all_for_owner(
            db=db, owner_id=owner_id, species=species, breed=breed, skip=skip, limit=limit
        )

    async def create_pet(
        self,
        db: AsyncSession,
        pet_in: PetCreate,
        owner_id: UUID,
        request: Request | None = None,
    ) -> Pet:
        """Create a new pet for the current user."""
        pet = await self.pet_repo.create(db=db, pet_in=pet_in, owner_id=owner_id)
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="create",
                resource_type="pet",
                user_id=owner_id,
                resource_id=str(pet.id),
                metadata={"pet_name": pet.name},
            )
        return pet

    async def update_pet(
        self,
        db: AsyncSession,
        pet_id: UUID,
        pet_in: PetUpdate,
        owner_id: UUID,
        request: Request | None = None,
    ) -> Pet:
        """Update a pet's information after verifying ownership."""
        pet_to_update = await self.get_pet_by_id(db=db, pet_id=pet_id, owner_id=owner_id)
        pet = await self.pet_repo.update(db=db, pet=pet_to_update, pet_in=pet_in)
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="update",
                resource_type="pet",
                user_id=owner_id,
                resource_id=str(pet.id),
                metadata={"pet_name": pet.name},
            )
        return pet

    async def delete_pet(
        self,
        db: AsyncSession,
        pet_id: UUID,
        owner_id: UUID,
        request: Request | None = None,
    ) -> Pet:
        """Soft delete a pet after verifying ownership."""
        pet_to_delete = await self.get_pet_by_id(db=db, pet_id=pet_id, owner_id=owner_id)
        pet = await self.pet_repo.soft_delete(db=db, pet=pet_to_delete)
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="delete",
                resource_type="pet",
                user_id=owner_id,
                resource_id=str(pet.id),
                metadata={"pet_name": pet.name},
            )
        return pet