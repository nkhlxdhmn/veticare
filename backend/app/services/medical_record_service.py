"""
Service layer for medical record-related business logic.
"""
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.medical_record import MedicalRecord
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.repositories.pet_repository import PetRepository
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate
from app.services.audit_service import AuditService

class MedicalRecordService:
    """
    Orchestrates medical record logic, coordinating between the API layer
    and the data access layer.
    """
    def __init__(
        self,
        medical_record_repo: MedicalRecordRepository = Depends(),
        pet_repo: PetRepository = Depends(),
        audit_service: AuditService | None = None,
    ) -> None:
        self.medical_record_repo = medical_record_repo
        self.pet_repo = pet_repo
        self.audit_service = audit_service or AuditService()

    async def _get_record_and_verify_ownership(self, db: AsyncSession, record_id: UUID, owner_id: UUID) -> MedicalRecord:
        """Helper to retrieve a record and check if the current user owns the associated pet."""
        record = await self.medical_record_repo.get_by_id(db, record_id=record_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found")
        
        pet = await self.pet_repo.get_by_id(db, pet_id=record.pet_id)
        if not pet or pet.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this record")
        
        return record

    async def create_record(
        self,
        db: AsyncSession,
        record_in: MedicalRecordCreate,
        owner_id: UUID,
        request: Request | None = None,
    ) -> MedicalRecord:
        """Create a new medical record after validating pet ownership."""
        pet = await self.pet_repo.get_by_id(db, pet_id=record_in.pet_id)
        if not pet or pet.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found or access denied")
        record = await self.medical_record_repo.create(db, record_in=record_in)
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="create",
                resource_type="medical_record",
                user_id=owner_id,
                resource_id=str(record.id),
                metadata={"pet_id": str(record_in.pet_id)},
            )
        return record

    async def get_records_for_pet(
        self, db: AsyncSession, pet_id: UUID, owner_id: UUID, skip: int, limit: int
    ) -> list[MedicalRecord]:
        """Return medical records only after validating pet ownership."""
        pet = await self.pet_repo.get_by_id(db, pet_id=pet_id)
        if not pet or pet.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found or access denied")
        return await self.medical_record_repo.get_all_for_pet(
            db=db, pet_id=pet_id, skip=skip, limit=limit
        )

    async def update_record(
        self,
        db: AsyncSession,
        record_id: UUID,
        record_in: MedicalRecordUpdate,
        owner_id: UUID,
        request: Request | None = None,
    ) -> MedicalRecord:
        """Update a medical record after verifying ownership."""
        record_to_update = await self._get_record_and_verify_ownership(
            db,
            record_id=record_id,
            owner_id=owner_id,
        )
        record = await self.medical_record_repo.update(
            db,
            record=record_to_update,
            record_in=record_in,
        )
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="update",
                resource_type="medical_record",
                user_id=owner_id,
                resource_id=str(record.id),
                metadata={"pet_id": str(record_to_update.pet_id)},
            )
        return record

    async def delete_record(
        self,
        db: AsyncSession,
        record_id: UUID,
        owner_id: UUID,
        request: Request | None = None,
    ) -> None:
        """Delete a medical record after verifying ownership."""
        record_to_delete = await self._get_record_and_verify_ownership(
            db,
            record_id=record_id,
            owner_id=owner_id,
        )
        await self.medical_record_repo.delete(db, record=record_to_delete)
        if request is not None:
            await self.audit_service.record(
                db,
                request,
                action="delete",
                resource_type="medical_record",
                user_id=owner_id,
                resource_id=str(record_id),
                metadata={"pet_id": str(record_to_delete.pet_id)},
            )
