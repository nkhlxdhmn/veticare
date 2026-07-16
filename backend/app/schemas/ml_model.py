"""ML model registry response schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class MLModelResponse(BaseModel):

    id: uuid.UUID
    model_name: str
    version: str
    accuracy: float | None = None
    bucket_path: str
    is_active: bool
    uploaded_at: datetime
    created_at: datetime
