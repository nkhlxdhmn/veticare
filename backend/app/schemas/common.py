"""Shared pagination schema."""

from pydantic import BaseModel, Field


class PaginationParams(BaseModel):
    """Query parameters for paginated list endpoints."""
    offset: int = Field(default=0, ge=0, description="Number of items to skip")
    limit: int = Field(default=20, ge=1, le=100, description="Max items to return")
