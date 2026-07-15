"""Authentication request and response schemas."""

from pydantic import BaseModel, Field


class TokenPairResponse(BaseModel):
    """Access and refresh tokens issued after authentication."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Request body for refresh-token rotation and logout."""

    refresh_token: str = Field(min_length=1)
