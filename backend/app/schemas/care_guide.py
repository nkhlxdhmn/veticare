"""Care guide response schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CareGuideResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    animal: str
    disease: str | None = None
    diet: str | None = None
    dos: str | None = None
    donts: str | None = None
    medication: str | None = None
    warning_signs: str | None = None
    recovery_time: str | None = None
    created_at: datetime
