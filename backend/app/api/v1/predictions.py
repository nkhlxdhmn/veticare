"""API endpoints for AI disease predictions."""

from uuid import UUID

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, get_prediction_service, require_roles
from app.models.role import UserRole
from app.models.user import User
from app.schemas.prediction import (
    PredictionHistoryItem,
    PredictionRequest,
    PredictionResponse,
    PredictionResultResponse,
)
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.post(
    "/",
    response_model=PredictionResultResponse,
    status_code=status.HTTP_201_CREATED,
)
async def predict_disease(
    request: Request,
    prediction_in: PredictionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    prediction_service: PredictionService = Depends(get_prediction_service),
):
    """Run disease prediction based on symptoms for a specific pet."""
    return await prediction_service.predict_disease(
        db=db,
        prediction_in=prediction_in,
        owner_id=current_user.id,
        request=request,
    )


@router.get("/", response_model=list[PredictionHistoryItem])
async def get_prediction_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    prediction_service: PredictionService = Depends(get_prediction_service),
):
    """Retrieve prediction history for the current user's pets."""
    return await prediction_service.get_prediction_history(db, owner_id=current_user.id)


@router.get("/{prediction_id}", response_model=PredictionResponse)
async def get_prediction_details(
    prediction_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    prediction_service: PredictionService = Depends(get_prediction_service),
):
    """Retrieve details of a specific prediction log."""
    return await prediction_service.get_prediction_details(
        db=db,
        prediction_id=prediction_id,
        owner_id=current_user.id,
    )


router.dependencies.append(
    require_roles((UserRole.PET_OWNER, UserRole.VETERINARIAN, UserRole.CLINIC_ADMIN, UserRole.SUPER_ADMIN))
)
