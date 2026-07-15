"""Animal encyclopedia business logic."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Animal


def get_animals(session: Session, offset: int = 0, limit: int = 20) -> list[Animal]:
    """Return animal species with pagination."""
    return list(session.scalars(select(Animal).order_by(Animal.name).offset(offset).limit(limit)).unique())


def get_animal_by_id(session: Session, animal_id: uuid.UUID) -> Animal | None:
    """Fetch a single animal by primary key."""
    return session.get(Animal, animal_id)
