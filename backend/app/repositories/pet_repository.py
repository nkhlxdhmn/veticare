"""
Repository for pet-related database operations.
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.pet import Pet
from app.schemas.pet import PetCreate, PetUpdate

class PetRepository:
    """
    This class handles all database operations related to the Pet model.
    """

    async def get_by_id(self, db: AsyncSession, pet_id: UUID) -> Optional[Pet]:
        """Retrieve a single pet by its UUID."""
        return await db.get(Pet, pet_id)

    async def get_all_for_owner(
        self, db: AsyncSession, owner_id: UUID, species: Optional[str], breed: Optional[str], skip: int, limit: int
    ) -> List[Pet]:
        """Retrieve all pets for a given owner with optional filtering and pagination."""
        query = select(Pet).where(Pet.owner_id == owner_id)
        if species:
            query = query.where(Pet.species.ilike(f"%{species}%"))
        if breed:
            query = query.where(Pet.breed.ilike(f"%{breed}%"))
        
        result = await db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, pet_in: PetCreate, owner_id: UUID) -> Pet:
        """Create a new pet record for a specific owner."""
        db_pet = Pet(**pet_in.model_dump(), owner_id=owner_id)
        db.add(db_pet)
        await db.commit()
        await db.refresh(db_pet)
        return db_pet

    async def update(self, db: AsyncSession, pet: Pet, pet_in: PetUpdate) -> Pet:
        """Update an existing pet record."""
        update_data = pet_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(pet, key, value)
        
        db.add(pet)
        await db.commit()
        await db.refresh(pet)
        return pet

    async def soft_delete(self, db: AsyncSession, pet: Pet) -> Pet:
        """Soft delete a pet by setting its is_active flag to False."""
        pet.is_active = False
        db.add(pet)
        await db.commit()
        await db.refresh(pet)
        return pet