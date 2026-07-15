"""Testing environment configuration."""

from app.config.base import BaseSettings


class TestingSettings(BaseSettings):
    """Safe defaults for automated tests."""

    environment: str = "testing"
    debug: bool = False
