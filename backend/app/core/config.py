"""Backward-compatible access to environment-aware application settings."""

from app.config.factory import get_settings

settings = get_settings()
