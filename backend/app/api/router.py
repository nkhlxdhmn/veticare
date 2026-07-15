"""Central API router."""

from fastapi import APIRouter

from app.api.dependencies import SettingsDependency
from app.api.routes.auth import router as auth_router

api_router = APIRouter()
api_router.include_router(auth_router)


@api_router.get("/status", tags=["status"])
async def api_status(settings: SettingsDependency) -> dict[str, str]:
    """Return non-sensitive API status information."""
    return {"service": settings.app_name, "environment": settings.environment}
