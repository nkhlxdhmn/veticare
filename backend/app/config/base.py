"""Shared configuration values for every deployment environment."""

from collections.abc import Sequence

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings as PydanticBaseSettings
from pydantic_settings import SettingsConfigDict


class BaseSettings(PydanticBaseSettings):
    """Configuration loaded from environment variables and an optional `.env` file."""

    app_name: str = "VetiCare API"
    environment: str = "development"
    debug: bool = Field(default=False, validation_alias="VETICARE_DEBUG")
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/veticare"
    secret_key: SecretStr = SecretStr("change-me-before-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=30, ge=1, le=1_440)
    refresh_token_expire_days: int = Field(default=14, ge=1, le=90)
    cors_origins: Sequence[str] = ("http://localhost:3000",)
    trusted_hosts: Sequence[str] = ("localhost", "127.0.0.1", "testserver")
    rate_limit_requests: int = Field(default=120, ge=1)
    rate_limit_window_seconds: int = Field(default=60, ge=1)
    supabase_url: str | None = Field(default=None, validation_alias="SUPABASE_URL")
    supabase_publishable_key: str | None = Field(default=None, validation_alias="SUPABASE_PUBLISHABLE_KEY")
    supabase_secret_key: str | None = Field(default=None, validation_alias="SUPABASE_SECRET_KEY")
    supabase_jwks_url: str | None = Field(default=None, validation_alias="SUPABASE_JWKS_URL")
    app_port: int = Field(default=8000, ge=1, le=65535, validation_alias="PORT")
    
    @field_validator("database_url", mode="before")
    @classmethod
    def check_database_url(cls, v: str | None) -> str:
        if not v:
            return "postgresql+psycopg://postgres:postgres@localhost:5432/veticare"
        
        # Ensure it has the psycopg driver
        v = v.strip().strip("'").strip('"')
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+psycopg://", 1)
        elif v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+psycopg://", 1)
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )
