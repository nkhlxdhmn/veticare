"""Environment-aware application configuration."""

from app.config.base import BaseSettings
from app.config.factory import get_settings

__all__ = ["BaseSettings", "get_settings"]
