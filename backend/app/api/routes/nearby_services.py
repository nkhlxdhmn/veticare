"""OpenStreetMap-based nearby services HTTP endpoints."""

import logging
import math

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.nearby import (
    GeocodeResponse,
    GeocodeResult,
    Location,
    NearbyPlace,
    NearbyResponse,
    SearchResponse,
    SearchResult,
)
from app.services.nearby_services import reverse_geocode, search_nearby_osm, search_places

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/maps", tags=["maps"])


PLACE_TYPES = ["veterinary", "pet_shop", "pet_food", "animal_hospital", "ngo", "animal_shelter"]


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in km between two lat/lng points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


@router.get("/search", response_model=SearchResponse)
async def search_location(
    q: str = Query(..., min_length=2, description="Search query (city, pincode, place)"),
    limit: int = Query(default=5, ge=1, le=20),
) -> SearchResponse:
    """Search for locations using Nominatim."""
    try:
        results = await search_places(q, limit=limit)
    except Exception:
        logger.exception("Location search failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Search service unavailable")

    return SearchResponse(
        results=[SearchResult(**r) for r in results],
        count=len(results),
    )


@router.get("/nearby", response_model=NearbyResponse)
async def get_nearby_places(
    latitude: float = Query(..., ge=-90, le=90, description="Center latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Center longitude"),
    radius: int = Query(default=5000, ge=100, le=50000, description="Search radius in meters"),
    place_type: str = Query(default="veterinary", description=f"Place type: {', '.join(PLACE_TYPES)}"),
) -> NearbyResponse:
    """Return nearby places from OpenStreetMap via Overpass API."""
    if place_type not in PLACE_TYPES:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Invalid place type. Must be one of: {', '.join(PLACE_TYPES)}")

    try:
        places = await search_nearby_osm(latitude, longitude, radius, place_type)
    except Exception:
        logger.exception("Overpass API request failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Failed to fetch nearby places")

    for place in places:
        place["distance"] = round(_haversine(latitude, longitude, place["lat"], place["lng"]), 2)

    return NearbyResponse(
        places=[NearbyPlace(**p) for p in places],
        count=len(places),
        center=Location(lat=latitude, lng=longitude),
    )


@router.get("/geocode", response_model=GeocodeResponse)
async def geocode_location(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude"),
) -> GeocodeResponse:
    """Reverse geocode coordinates to an address using Nominatim."""
    try:
        result = await reverse_geocode(lat, lng)
    except Exception:
        logger.exception("Reverse geocode failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Geocode service unavailable")

    if not result:
        return GeocodeResponse(result=None)

    return GeocodeResponse(result=GeocodeResult(**result))
