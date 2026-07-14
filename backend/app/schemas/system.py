"""Response schemas for public infrastructure endpoints."""

from pydantic import BaseModel


class WelcomeResponse(BaseModel):
    """Response returned by the API root endpoint."""

    message: str


class HealthResponse(BaseModel):
    """Response returned by the health-check endpoint."""

    status: str
