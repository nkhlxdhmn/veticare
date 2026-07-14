"""
Repository for prediction-related database operations.
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.prediction import Prediction
from app.models.pet import Pet
from app.schemas.prediction import PredictionCreate

class PredictionRepository:
    """
    Handles all database operations for the Prediction model.
    """

    async def create(self, db: AsyncSession, prediction_in: PredictionCreate, pet_id: UUID) -> Prediction:
        """Create a new prediction log in the database."""
        db_prediction = Prediction(**prediction_in.model_dump(), pet_id=pet_id)
        db.add(db_prediction)
        await db.commit()
        await db.refresh(db_prediction)
        return db_prediction

    async def get_by_id(self, db: AsyncSession, prediction_id: UUID) -> Optional[Prediction]:
        """Retrieve a single prediction by its UUID."""
        return await db.get(Prediction, prediction_id)

    async def get_all_for_user(self, db: AsyncSession, owner_id: UUID) -> List[Prediction]:
        """Retrieve all prediction logs for a given user's pets."""
        result = await db.execute(select(Prediction).join(Pet).where(Pet.owner_id == owner_id).options(selectinload(Prediction.pet)))
        return list(result.scalars().all())