"""
Placeholder for pet-related API endpoints.
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.pet import PetCreate, PetResponse, PetUpdate
from app.services.pet_service import PetService

router = APIRouter()

@router.post("/", response_model=PetResponse, status_code=status.HTTP_201_CREATED)
async def create_pet(
    pet_in: PetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pet_service: PetService = Depends(),
):
    """Create a new pet for the currently authenticated user."""
    return await pet_service.create_pet(db=db, pet_in=pet_in, owner_id=current_user.id)

@router.get("/", response_model=List[PetResponse])
async def get_all_pets(
    species: Optional[str] = Query(None, description="Filter pets by species"),
    breed: Optional[str] = Query(None, description="Filter pets by breed"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=200, description="Number of items to return"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pet_service: PetService = Depends(),
):
    """Retrieve all pets for the current user with optional filters and pagination."""
    return await pet_service.get_all_pets_for_owner(
        db=db, owner_id=current_user.id, species=species, breed=breed, skip=skip, limit=limit
    )

@router.get("/{pet_id}", response_model=PetResponse)
async def get_pet(
    pet_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pet_service: PetService = Depends(),
):
    """Retrieve a specific pet by its ID."""
    return await pet_service.get_pet_by_id(db=db, pet_id=pet_id, owner_id=current_user.id)

@router.put("/{pet_id}", response_model=PetResponse)
async def update_pet(
    pet_id: UUID,
    pet_in: PetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pet_service: PetService = Depends(),
):
    """Update a pet's information."""
    return await pet_service.update_pet(db=db, pet_id=pet_id, pet_in=pet_in, owner_id=current_user.id)

@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet(
    pet_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pet_service: PetService = Depends(),
):
    """Soft delete a pet."""
    await pet_service.delete_pet(db=db, pet_id=pet_id, owner_id=current_user.id)
    return None