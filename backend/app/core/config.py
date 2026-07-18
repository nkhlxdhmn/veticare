"""Validated application settings loaded from environment variables."""

import json
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIRECTORY = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application configuration with safe development defaults."""

    app_name: str = "VetiCare API"
    version: str = "1.0.0"
    environment: Literal["development", "test", "production"] = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://veticare-seven.vercel.app",
        "https://veticare.vercel.app",
    ]

    veticare_supabase_url: str = ""
    veticare_supabase_key: str = ""
    jwt_secret_key: SecretStr = SecretStr("development-only-change-me")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=30, gt=0, le=1_440)
    gemini_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIRECTORY / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        validate_default=True,
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        """Accept a JSON array, a Python list, or a comma-separated string."""
        if isinstance(value, list):
            return value
        if not isinstance(value, str):
            return value
        if value.startswith("["):
            return json.loads(value)
        return [origin.strip() for origin in value.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        """Reject the insecure development secret in production."""
        if (
            self.environment == "production"
            and self.jwt_secret_key.get_secret_value() == "development-only-change-me"
        ):
            raise ValueError("JWT_SECRET_KEY must be set to a secure value in production")
        return self


@lru_cache
def get_settings() -> Settings:
    """Create settings once and reuse them as a FastAPI dependency."""
    return Settings()
