"""
Service layer for medical record-related business logic.
"""
from typing import List
from uuid import UUID
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.medical_record import MedicalRecord
from app.repositories.pet_repository import PetRepository
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate

class MedicalRecordService:
    """
    Orchestrates medical record logic, coordinating between the API layer
    and the data access layer.
    """
    def __init__(
        self,
        medical_record_repo: MedicalRecordRepository = Depends(),
        pet_repo: PetRepository = Depends()
    ):
        self.medical_record_repo = medical_record_repo
        self.pet_repo = pet_repo

    async def _get_record_and_verify_ownership(self, db: AsyncSession, record_id: UUID, owner_id: UUID) -> MedicalRecord:
        """Helper to retrieve a record and check if the current user owns the associated pet."""
        record = await self.medical_record_repo.get_by_id(db, record_id=record_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical record not found")
        
        pet = await self.pet_repo.get_by_id(db, pet_id=record.pet_id)
        if not pet or pet.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this record")
        
        return record

    async def create_record(self, db: AsyncSession, record_in: MedicalRecordCreate, owner_id: UUID) -> MedicalRecord:
        """Create a new medical record after validating pet ownership."""
        pet = await self.pet_repo.get_by_id(db, pet_id=record_in.pet_id)
        if not pet or pet.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found or access denied")
        return await self.medical_record_repo.create(db, record_in=record_in)

    async def update_record(self, db: AsyncSession, record_id: UUID, record_in: MedicalRecordUpdate, owner_id: UUID) -> MedicalRecord:
        """Update a medical record after verifying ownership."""
        record_to_update = await self._get_record_and_verify_ownership(db, record_id=record_id, owner_id=owner_id)
        return await self.medical_record_repo.update(db, record=record_to_update, record_in=record_in)

    async def delete_record(self, db: AsyncSession, record_id: UUID, owner_id: UUID):
        """Delete a medical record after verifying ownership."""
        record_to_delete = await self._get_record_and_verify_ownership(db, record_id=record_id, owner_id=owner_id)
        await self.medical_record_repo.delete(db, record=record_to_delete)