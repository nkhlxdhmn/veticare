"""Animal request and response schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class AnimalResponse(BaseModel):

    id: uuid.UUID
    name: str
    scientific_name: str | None = None
    description: str | None = None
    image_url: str | None = None
    diet: str | None = None
    average_lifespan: str | None = None
    vaccination_schedule: dict | None = None
    care_guide: dict | None = None
    created_at: datetime
