"""Production environment configuration."""

from pydantic import model_validator

from app.config.base import BaseSettings


class ProductionSettings(BaseSettings):
    """Production defaults and startup secret validation."""

    debug: bool = False

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "ProductionSettings":
        """Reject known-insecure secrets and placeholder URLs in production."""
        if self.secret_key.get_secret_value() == "change-me-before-production":
            raise ValueError("SECRET_KEY must be set in production")
        if self.database_url.startswith("postgresql+psycopg://postgres:postgres@localhost"):
            raise ValueError("DATABASE_URL must target the production database")
        return self
