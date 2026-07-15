"""API endpoints for Health Centres."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_roles
from app.models.role import UserRole
from app.models.user import User
from app.schemas.health_centre import HealthCentreCreate, HealthCentreResponse, HealthCentreUpdate
from app.services.health_centre_service import HealthCentreService

router = APIRouter()

def get_clinic_service() -> HealthCentreService:
    return HealthCentreService()

@router.get("/", response_model=list[HealthCentreResponse])
async def list_clinics(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    clinic_service: HealthCentreService = Depends(get_clinic_service),
):
    """Retrieve all Health Centres."""
    return await clinic_service.get_all(db, skip=skip, limit=limit)


@router.get("/{clinic_id}", response_model=HealthCentreResponse)
async def get_clinic(
    clinic_id: UUID,
    db: AsyncSession = Depends(get_db),
    clinic_service: HealthCentreService = Depends(get_clinic_service),
):
    """Retrieve details of a specific Health Centre."""
    return await clinic_service.get_by_id(db, id=clinic_id)


@router.post("/", response_model=HealthCentreResponse, status_code=status.HTTP_201_CREATED)
async def create_clinic(
    clinic_in: HealthCentreCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles((UserRole.SUPER_ADMIN,))),
    clinic_service: HealthCentreService = Depends(get_clinic_service),
):
    """Register a new Health Centre (Requires SUPER_ADMIN)."""
    return await clinic_service.create(db, clinic_in=clinic_in)


@router.put("/{clinic_id}", response_model=HealthCentreResponse)
async def update_clinic(
    clinic_id: UUID,
    clinic_in: HealthCentreUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles((UserRole.SUPER_ADMIN,))),
    clinic_service: HealthCentreService = Depends(get_clinic_service),
):
    """Update a Health Centre's details."""
    return await clinic_service.update(db, id=clinic_id, clinic_in=clinic_in)


@router.delete("/{clinic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clinic(
    clinic_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles((UserRole.SUPER_ADMIN,))),
    clinic_service: HealthCentreService = Depends(get_clinic_service),
):
    """Delete a Health Centre."""
    await clinic_service.delete(db, id=clinic_id)
