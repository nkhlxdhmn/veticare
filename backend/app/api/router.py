"""Central API router."""

from fastapi import APIRouter

from app.api.dependencies import SettingsDependency
from app.api.routes.auth import router as auth_router
from app.api.routes.animal import router as animal_router
from app.api.routes.care_guide import router as care_guide_router
from app.api.routes.disease import router as disease_router
from app.api.routes.ml_model import router as ml_model_router
from app.api.routes.nearby_services import router as nearby_router
from app.api.routes.pet import router as pet_router
from app.api.routes.prediction import router as prediction_router
from app.api.routes.profile import router as profile_router
from app.api.routes.vaccination import router as vaccination_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(pet_router)
api_router.include_router(animal_router)
api_router.include_router(vaccination_router)
api_router.include_router(disease_router)
api_router.include_router(care_guide_router)
api_router.include_router(ml_model_router)
api_router.include_router(prediction_router)
api_router.include_router(nearby_router)


@api_router.get("/status", tags=["status"])
async def api_status(settings: SettingsDependency) -> dict[str, str]:
    """Return non-sensitive API status information."""
    return {"service": settings.app_name, "environment": settings.environment}
