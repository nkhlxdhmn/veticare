"""
Repository for medical record-related database operations.
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.medical_record import MedicalRecord
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate

class MedicalRecordRepository:
    """
    Handles all database operations for the MedicalRecord model.
    """

    async def get_by_id(self, db: AsyncSession, record_id: UUID) -> Optional[MedicalRecord]:
        """Retrieve a single medical record by its UUID."""
        return await db.get(MedicalRecord, record_id)

    async def get_all_for_pet(self, db: AsyncSession, pet_id: UUID, skip: int, limit: int) -> List[MedicalRecord]:
        """Retrieve all medical records for a specific pet with pagination."""
        from sqlalchemy.orm import selectinload
        query = (
            select(MedicalRecord)
            .options(selectinload(MedicalRecord.pet))
            .where(MedicalRecord.pet_id == pet_id)
            .order_by(MedicalRecord.visit_date.desc())
        )
        result = await db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, record_in: MedicalRecordCreate) -> MedicalRecord:
        """Create a new medical record."""
        db_record = MedicalRecord(**record_in.model_dump())
        db.add(db_record)
        await db.commit()
        await db.refresh(db_record)
        return db_record

    async def update(self, db: AsyncSession, record: MedicalRecord, record_in: MedicalRecordUpdate) -> MedicalRecord:
        """Update an existing medical record."""
        update_data = record_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(record, key, value)
        db.add(record)
        await db.commit()
        await db.refresh(record)
        return record

    async def delete(self, db: AsyncSession, record: MedicalRecord) -> None:
        """Permanently delete a medical record."""
        await db.delete(record)
        await db.commit()