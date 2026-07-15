"""Reusable FastAPI dependencies for API routes."""

from typing import Annotated

from fastapi import Depends

from app.core.config import Settings, get_settings

SettingsDependency = Annotated[Settings, Depends(get_settings)]
