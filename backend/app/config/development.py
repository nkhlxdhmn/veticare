"""Development environment configuration."""

from pydantic import Field

from app.config.base import BaseSettings


class DevelopmentSettings(BaseSettings):
    """Local-development defaults."""

    debug: bool = Field(default=True, validation_alias="VETICARE_DEBUG")
