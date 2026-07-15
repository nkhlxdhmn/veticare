"""Pet-related API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, get_pet_service, require_roles
from app.models.role import UserRole
from app.models.user import User
from app.schemas.pet import PetCreate, PetResponse, PetUpdate
from app.services.pet_service import PetService

router = APIRouter()


@router.post(
    "/",
    response_model=PetResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_pet(
    request: Request,
    pet_in: PetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pet_service: PetService = Depends(get_pet_service),
):
    """Create a new pet for the currently authenticated user."""
    return await pet_service.create_pet(
        db=db,
        pet_in=pet_in,
        owner_id=current_user.id,
        request=request,
    )


@router.get("/", response_model=list[PetResponse])
async def get_all_pets(
    species: str | None = Query(None, description="Filter pets by species"),
    breed: str | None = Query(None, description="Filter pets by breed"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=200, description="Number of items to return"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pet_service: PetService = Depends(get_pet_service),
):
    """Retrieve all pets for the current user with optional filters and pagination."""
    return await pet_service.get_all_pets_for_owner(
        db=db,
        owner_id=current_user.id,
        species=species,
        breed=breed,
        skip=skip,
        limit=limit,
    )


@router.get("/{pet_id}", response_model=PetResponse)
async def get_pet(
    pet_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pet_service: PetService = Depends(get_pet_service),
):
    """Retrieve a specific pet by its ID."""
    return await pet_service.get_pet_by_id(
        db=db,
        pet_id=pet_id,
        owner_id=current_user.id,
    )


@router.put("/{pet_id}", response_model=PetResponse)
async def update_pet(
    request: Request,
    pet_id: UUID,
    pet_in: PetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pet_service: PetService = Depends(get_pet_service),
):
    """Update a pet's information."""
    return await pet_service.update_pet(
        db=db,
        pet_id=pet_id,
        pet_in=pet_in,
        owner_id=current_user.id,
        request=request,
    )


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet(
    request: Request,
    pet_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pet_service: PetService = Depends(get_pet_service),
):
    """Soft delete a pet."""
    await pet_service.delete_pet(
        db=db,
        pet_id=pet_id,
        owner_id=current_user.id,
        request=request,
    )
    return None


router.dependencies.append(require_roles((UserRole.PET_OWNER, UserRole.VETERINARIAN, UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN)))