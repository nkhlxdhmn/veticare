"""Animal disease business logic."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AnimalDisease


def get_diseases_by_animal(session: Session, animal_id: uuid.UUID, offset: int = 0, limit: int = 20) -> list[AnimalDisease]:
    """Return diseases for a specific animal species with pagination."""
    return list(
        session.scalars(
            select(AnimalDisease)
            .where(AnimalDisease.animal_id == animal_id)
            .order_by(AnimalDisease.disease_name)
            .offset(offset)
            .limit(limit)
        )
    )


def get_all_diseases(session: Session, offset: int = 0, limit: int = 20) -> list[AnimalDisease]:
    """Return all disease records with pagination."""
    return list(
        session.scalars(
            select(AnimalDisease).order_by(AnimalDisease.disease_name).offset(offset).limit(limit)
        )
    )
