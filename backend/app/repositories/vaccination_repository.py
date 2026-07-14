"""
Repository for vaccination-related database operations.
"""
from datetime import date, timedelta
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.vaccination import Vaccination
from app.models.pet import Pet
from app.schemas.vaccination import VaccinationCreate, VaccinationUpdate

class VaccinationRepository:
    """
    Handles all database operations for the Vaccination model.
    """

    async def get_by_id(self, db: AsyncSession, vaccination_id: UUID) -> Optional[Vaccination]:
        """Retrieve a single vaccination record by its UUID."""
        return await db.get(Vaccination, vaccination_id)

    async def get_all_for_pet(self, db: AsyncSession, pet_id: UUID, skip: int, limit: int) -> List[Vaccination]:
        """Retrieve all vaccination records for a specific pet with pagination."""
        query = select(Vaccination).where(Vaccination.pet_id == pet_id).order_by(Vaccination.date_administered.desc())
        result = await db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def get_upcoming_for_user(self, db: AsyncSession, owner_id: UUID, days: int) -> List[Vaccination]:
        """Retrieve upcoming vaccinations for all pets of a user."""
        today = date.today()
        future_date = today + timedelta(days=days)
        query = select(Vaccination).join(Pet).where(
            Pet.owner_id == owner_id,
            Vaccination.next_due_date.between(today, future_date)
        ).order_by(Vaccination.next_due_date)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, vaccination_in: VaccinationCreate, pet_id: UUID) -> Vaccination:
        """Create a new vaccination record."""
        db_vaccination = Vaccination(**vaccination_in.model_dump(), pet_id=pet_id)
        db.add(db_vaccination)
        await db.commit()
        await db.refresh(db_vaccination)
        return db_vaccination

    async def update(self, db: AsyncSession, vaccination: Vaccination, vaccination_in: VaccinationUpdate) -> Vaccination:
        """Update an existing vaccination record."""
        update_data = vaccination_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(vaccination, key, value)
        db.add(vaccination)
        await db.commit()
        await db.refresh(vaccination)
        return vaccination