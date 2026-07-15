"""API endpoints for Rescue Requests."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_roles
from app.models.role import UserRole
from app.models.user import User
from app.schemas.rescue_request import RescueRequestCreate, RescueRequestResponse, RescueRequestUpdate
from app.services.rescue_request_service import RescueRequestService

router = APIRouter()

def get_rescue_service() -> RescueRequestService:
    return RescueRequestService()

@router.get("/", response_model=list[RescueRequestResponse])
async def list_rescue_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    rescue_service: RescueRequestService = Depends(get_rescue_service),
):
    """Retrieve rescue requests relevant to the user."""
    return await rescue_service.get_all_for_owner(db, user_id=current_user.id)


@router.get("/pending", response_model=list[RescueRequestResponse])
async def list_pending_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles((UserRole.NGO_ADMIN, UserRole.SUPER_ADMIN))),
    rescue_service: RescueRequestService = Depends(get_rescue_service),
):
    """Retrieve all pending unassigned rescue requests (NGO only)."""
    return await rescue_service.get_pending_requests(db, skip=skip, limit=limit)


@router.post("/", response_model=RescueRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_rescue_request(
    request_in: RescueRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles((UserRole.PET_OWNER, UserRole.SUPER_ADMIN))),
    rescue_service: RescueRequestService = Depends(get_rescue_service),
):
    """Submit a new rescue request."""
    return await rescue_service.create(db, request_in=request_in, user_id=current_user.id)


@router.patch("/{request_id}/status", response_model=RescueRequestResponse)
async def update_rescue_status(
    request_id: UUID,
    status_update: str = Query(..., description="Status to update (e.g. ACCEPTED, REJECTED, RESOLVED)"),
    ngo_id: UUID = Query(None, description="NGO to assign if ACCEPTED"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles((UserRole.SUPER_ADMIN,))),
    rescue_service: RescueRequestService = Depends(get_rescue_service),
):
    """Update a rescue request's status (SUPER_ADMIN only)."""
    return await rescue_service.update_status(db, id=request_id, status_update=status_update, ngo_id=ngo_id)
