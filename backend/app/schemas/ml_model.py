"""ML model registry response schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MLModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    model_name: str
    version: str
    accuracy: float | None = None
    bucket_path: str
    is_active: bool
    uploaded_at: datetime
    created_at: datetime
