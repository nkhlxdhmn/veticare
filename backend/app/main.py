"""FastAPI application entry point for VetiCare."""

from fastapi import FastAPI

from app.core.config import settings
from app.schemas.system import HealthResponse, WelcomeResponse

app = FastAPI(
    title=settings.app_name,
    description="AI-powered pet healthcare platform backend.",
    version="0.1.0",
)


@app.get("/", response_model=WelcomeResponse, tags=["Root"])
def read_root() -> WelcomeResponse:
    """Return a welcome message for the API."""
    return WelcomeResponse(message="Welcome to VetiCare API")


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check() -> HealthResponse:
    """Report that the API process is healthy."""
    return HealthResponse(status="healthy")
