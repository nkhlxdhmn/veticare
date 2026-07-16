"""Nearby services response schemas for OpenStreetMap."""

from pydantic import BaseModel, Field


class Location(BaseModel):
    lat: float
    lng: float


class NearbyPlace(BaseModel):
    osm_id: int | None = None
    osm_type: str | None = None
    name: str
    address: str = ""
    lat: float
    lng: float
    type: str = ""
    type_label: str = ""
    phone: str = ""
    website: str = ""
    opening_hours: str = ""
    distance: float | None = None


class NearbyResponse(BaseModel):
    places: list[NearbyPlace]
    count: int
    center: Location | None = None


class SearchResult(BaseModel):
    osm_id: int | None = None
    osm_type: str | None = None
    name: str
    display_name: str
    lat: float
    lng: float
    type: str = ""
    category: str = ""


class SearchResponse(BaseModel):
    results: list[SearchResult]
    count: int


class GeocodeResult(BaseModel):
    osm_id: int | None = None
    osm_type: str | None = None
    display_name: str
    lat: float
    lng: float
    address: dict = {}


class GeocodeResponse(BaseModel):
    result: GeocodeResult | None = None
