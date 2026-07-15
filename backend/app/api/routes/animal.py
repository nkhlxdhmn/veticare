"""Animal encyclopedia HTTP endpoints."""

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from app.api.dependencies import DatabaseSession
from app.schemas.animal import AnimalResponse
from app.services.animal import get_animal_by_id, get_animals

router = APIRouter(prefix="/animals", tags=["animals"])


@router.get("", response_model=list[AnimalResponse])
def list_animals(
    session: DatabaseSession,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[AnimalResponse]:
    """Return animal species with pagination."""
    return get_animals(session, offset=offset, limit=limit)


@router.get("/{animal_id}", response_model=AnimalResponse)
def read_animal(animal_id: uuid.UUID, session: DatabaseSession) -> AnimalResponse:
    """Return a single animal by ID."""
    animal = get_animal_by_id(session, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    return animal
