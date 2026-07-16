"""Animal disease response schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class DiseaseResponse(BaseModel):

    id: uuid.UUID
    animal_id: uuid.UUID
    disease_name: str
    symptoms: str | None = None
    causes: str | None = None
    treatment: str | None = None
    prevention: str | None = None
    created_at: datetime
