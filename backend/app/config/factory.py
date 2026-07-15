"""Factory for selecting environment-specific settings."""

import os
from functools import lru_cache

from app.config.base import BaseSettings
from app.config.development import DevelopmentSettings
from app.config.production import ProductionSettings
from app.config.testing import TestingSettings


@lru_cache
def get_settings() -> BaseSettings:
    """Return settings selected by the `ENVIRONMENT` variable."""
    environment = os.getenv("ENVIRONMENT", "development").lower()
    settings_types: dict[str, type[BaseSettings]] = {
        "development": DevelopmentSettings,
        "production": ProductionSettings,
        "testing": TestingSettings,
    }
    return settings_types.get(environment, DevelopmentSettings)()
