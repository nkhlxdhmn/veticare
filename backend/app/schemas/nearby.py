"""Nearby services response schemas."""

from pydantic import BaseModel, Field


class Location(BaseModel):
    lat: float
    lng: float


class NearbyService(BaseModel):
    name: str
    address: str | None = None
    rating: float | None = None
    total_ratings: int = 0
    location: Location
    open_now: bool | None = None
    place_id: str | None = None


class NearbyResponse(BaseModel):
    services: list[NearbyService]
    count: int
