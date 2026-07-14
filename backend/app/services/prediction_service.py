"""
Service layer for AI prediction business logic.
"""
from uuid import UUID
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.predictor import model_loader
from app.ai.recommendations import get_recommendation
from app.repositories.pet_repository import PetRepository
from app.repositories.prediction_repository import PredictionRepository
from app.schemas.prediction import PredictionCreate, PredictionRequest

class PredictionService:
    """
    Orchestrates the prediction workflow, from input validation to
    model inference and result storage.
    """
    def __init__(
        self,
        pet_repo: PetRepository = Depends(),
        prediction_repo: PredictionRepository = Depends()
    ):
        self.pet_repo = pet_repo
        self.prediction_repo = prediction_repo

    async def predict_disease(
        self, db: AsyncSession, prediction_in: PredictionRequest, owner_id: UUID
    ):
        """Handles the main prediction logic."""
        # 1. Validate pet ownership
        pet = await self.pet_repo.get_by_id(db, pet_id=prediction_in.pet_id)
        if not pet or pet.owner_id != owner_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found or access denied")

        # 2. Run inference using the model loader
        predicted_disease, confidence, processing_time_ms = model_loader.predict(prediction_in.symptoms)

        # 3. Get recommendation
        recommendation_data = get_recommendation(predicted_disease)

        # 4. Save prediction to database
        prediction_log = PredictionCreate(
            symptoms=prediction_in.symptoms,
            predicted_disease=predicted_disease,
            confidence=confidence,
            dangerous=recommendation_data["dangerous"],
            model_version=model_loader.model_version,
            processing_time_ms=processing_time_ms
        )
        await self.prediction_repo.create(db, prediction_in=prediction_log, pet_id=prediction_in.pet_id)

        # 5. Return structured response
        return {
            "predicted_disease": predicted_disease,
            "confidence": confidence,
            **recommendation_data
        }