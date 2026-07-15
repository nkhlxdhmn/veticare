"""Pet business logic."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Pet
from app.schemas.pet import PetCreate, PetUpdate


def create_pet(session: Session, owner_id: uuid.UUID, data: PetCreate) -> Pet:
    """Create a new pet belonging to the given owner."""
    pet = Pet(owner_id=owner_id, **data.model_dump())
    session.add(pet)
    session.commit()
    session.refresh(pet, attribute_names=["animal"])
    return pet


def get_pets_by_owner(session: Session, owner_id: uuid.UUID, offset: int = 0, limit: int = 20) -> list[Pet]:
    """Return all pets owned by a specific user, with animal info loaded."""
    return list(
        session.scalars(
            select(Pet)
            .where(Pet.owner_id == owner_id)
            .options(joinedload(Pet.animal))
            .order_by(Pet.created_at.desc())
            .offset(offset)
            .limit(limit)
        ).unique()
    )


def get_pet_by_id(session: Session, pet_id: uuid.UUID, owner_id: uuid.UUID) -> Pet | None:
    """Return a single pet only if it belongs to the given owner."""
    return session.scalar(
        select(Pet)
        .where(Pet.id == pet_id, Pet.owner_id == owner_id)
        .options(joinedload(Pet.animal))
    )


def update_pet(session: Session, pet: Pet, data: PetUpdate) -> Pet:
    """Apply partial updates to a pet and persist."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pet, field, value)
    session.commit()
    session.refresh(pet, attribute_names=["animal"])
    return pet


def delete_pet(session: Session, pet: Pet) -> None:
    """Remove a pet and cascade-delete its vaccinations and predictions."""
    session.delete(pet)
    session.commit()
