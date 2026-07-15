"""API endpoints for NGOs."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_roles
from app.models.role import UserRole
from app.models.user import User
from app.schemas.ngo import NGOCreate, NGOResponse, NGOUpdate
from app.services.ngo_service import NGOService

router = APIRouter()

def get_ngo_service() -> NGOService:
    return NGOService()

@router.get("/", response_model=list[NGOResponse])
async def list_ngos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    ngo_service: NGOService = Depends(get_ngo_service),
):
    """Retrieve all NGOs."""
    return await ngo_service.get_all(db, skip=skip, limit=limit)


@router.get("/{ngo_id}", response_model=NGOResponse)
async def get_ngo(
    ngo_id: UUID,
    db: AsyncSession = Depends(get_db),
    ngo_service: NGOService = Depends(get_ngo_service),
):
    """Retrieve details of a specific NGO."""
    return await ngo_service.get_by_id(db, id=ngo_id)


@router.post("/", response_model=NGOResponse, status_code=status.HTTP_201_CREATED)
async def create_ngo(
    ngo_in: NGOCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles((UserRole.SUPER_ADMIN,))),
    ngo_service: NGOService = Depends(get_ngo_service),
):
    """Register a new NGO (Requires SUPER_ADMIN)."""
    return await ngo_service.create(db, ngo_in=ngo_in)


@router.put("/{ngo_id}", response_model=NGOResponse)
async def update_ngo(
    ngo_id: UUID,
    ngo_in: NGOUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles((UserRole.SUPER_ADMIN,))),
    ngo_service: NGOService = Depends(get_ngo_service),
):
    """Update an NGO's details."""
    return await ngo_service.update(db, id=ngo_id, ngo_in=ngo_in)


@router.delete("/{ngo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ngo(
    ngo_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles((UserRole.SUPER_ADMIN,))),
    ngo_service: NGOService = Depends(get_ngo_service),
):
    """Delete an NGO."""
    await ngo_service.delete(db, id=ngo_id)
