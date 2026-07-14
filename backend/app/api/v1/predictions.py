"""
API endpoints for AI disease predictions.
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.prediction import (
    PredictionRequest, 
    PredictionResultResponse, 
    PredictionResponse,
    PredictionHistoryItem
)
from app.services.prediction_service import PredictionService
from app.repositories.prediction_repository import PredictionRepository

router = APIRouter()

@router.post("/", response_model=PredictionResultResponse, status_code=status.HTTP_201_CREATED)
async def predict_disease(
    prediction_in: PredictionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    prediction_service: PredictionService = Depends(),
):
    """Run disease prediction based on symptoms for a specific pet."""
    return await prediction_service.predict_disease(db=db, prediction_in=prediction_in, owner_id=current_user.id)

@router.get("/", response_model=List[PredictionHistoryItem])
async def get_prediction_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    prediction_repo: PredictionRepository = Depends(),
):
    """Retrieve prediction history for the current user's pets."""
    predictions = await prediction_repo.get_all_for_user(db, owner_id=current_user.id)
    return [
        PredictionHistoryItem(
            id=p.id,
            date=p.created_at,
            pet_name=p.pet.name,
            predicted_disease=p.predicted_disease,
            confidence=p.confidence
        ) for p in predictions
    ]

@router.get("/{prediction_id}", response_model=PredictionResponse)
async def get_prediction_details(
    prediction_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    prediction_repo: PredictionRepository = Depends(),
):
    """Retrieve details of a specific prediction log."""
    prediction = await prediction_repo.get_by_id(db, prediction_id=prediction_id)
    if not prediction or prediction.pet.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    return prediction