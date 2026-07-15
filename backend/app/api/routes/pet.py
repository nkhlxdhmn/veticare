"""Pet HTTP endpoints."""

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from app.api.dependencies import CurrentUser, DatabaseSession
from app.schemas.pet import PetCreate, PetResponse, PetUpdate
from app.services.pet import create_pet, delete_pet, get_pet_by_id, get_pets_by_owner, update_pet

router = APIRouter(prefix="/pets", tags=["pets"])


def _get_pet_or_404(session, pet_id: uuid.UUID, user_id: uuid.UUID):
    """Return the pet or raise 404. Verifies ownership."""
    pet = get_pet_by_id(session, pet_id, user_id)
    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


@router.get("", response_model=list[PetResponse])
def list_pets(
    current_user: CurrentUser,
    session: DatabaseSession,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[PetResponse]:
    """Return all pets belonging to the authenticated user."""
    return get_pets_by_owner(session, current_user.id, offset=offset, limit=limit)


@router.post("", response_model=PetResponse, status_code=status.HTTP_201_CREATED)
def add_pet(body: PetCreate, current_user: CurrentUser, session: DatabaseSession) -> PetResponse:
    """Create a new pet for the authenticated user."""
    return create_pet(session, current_user.id, body)


@router.get("/{pet_id}", response_model=PetResponse)
def read_pet(pet_id: uuid.UUID, current_user: CurrentUser, session: DatabaseSession) -> PetResponse:
    """Return a single pet if it belongs to the authenticated user."""
    return _get_pet_or_404(session, pet_id, current_user.id)


@router.patch("/{pet_id}", response_model=PetResponse)
def patch_pet(pet_id: uuid.UUID, body: PetUpdate, current_user: CurrentUser, session: DatabaseSession) -> PetResponse:
    """Update a pet's fields."""
    pet = _get_pet_or_404(session, pet_id, current_user.id)
    return update_pet(session, pet, body)


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_pet(pet_id: uuid.UUID, current_user: CurrentUser, session: DatabaseSession) -> None:
    """Delete a pet and its cascaded records."""
    pet = _get_pet_or_404(session, pet_id, current_user.id)
    delete_pet(session, pet)
