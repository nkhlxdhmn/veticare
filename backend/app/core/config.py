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
    environment: Literal["development", "test", "production"] = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    secret_key: SecretStr = SecretStr("development-only-change-me")
    database_url: str | None = None
    access_token_expire_minutes: int = Field(default=30, gt=0, le=1_440)
    google_places_api_key: SecretStr = SecretStr("")
    supabase_url: str = ""
    supabase_publishable_key: str = ""
    supabase_secret_key: str = ""
    supabase_jwks_url: str = ""

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIRECTORY / ".env",
        env_file_encoding="utf-8",
        env_prefix="VETICARE_",
        case_sensitive=False,
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
            and self.secret_key.get_secret_value() == "development-only-change-me"
        ):
            raise ValueError("SECRET_KEY must be set to a secure value in production")
        if not self.supabase_jwks_url and self.supabase_url:
            self.supabase_jwks_url = f"{self.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
        return self


@lru_cache
def get_settings() -> Settings:
    """Create settings once and reuse them as a FastAPI dependency."""
    return Settings()
