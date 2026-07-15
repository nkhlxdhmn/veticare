"""Google Places nearby search service."""

from __future__ import annotations

import logging

from app.core.config import get_settings
from app.core.http import get_http_client

logger = logging.getLogger(__name__)

GOOGLE_PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"


async def search_nearby_vet_services(
    latitude: float,
    longitude: float,
    radius: int = 5000,
) -> list[dict]:
    """Query Google Places Nearby Search for veterinary services.

    Args:
        latitude: Search center latitude.
        longitude: Search center longitude.
        radius: Search radius in meters (max 50000).

    Returns:
        List of formatted place dicts with name, address, rating, location.
    """
    settings = get_settings()
    api_key = settings.google_places_api_key.get_secret_value()
    if not api_key:
        raise RuntimeError("GOOGLE_PLACES_API_KEY must be configured")

    params = {
        "location": f"{latitude},{longitude}",
        "radius": min(radius, 50_000),
        "type": "veterinary_care",
        "key": api_key,
    }

    client = get_http_client()
    response = await client.get(GOOGLE_PLACES_NEARBY_URL, params=params)
    response.raise_for_status()

    data = response.json()
    if data.get("status") != "OK":
        logger.warning("Google Places returned status: %s", data.get("status"))
        return []

    return [
        {
            "name": place.get("name"),
            "address": place.get("vicinity"),
            "rating": place.get("rating"),
            "total_ratings": place.get("user_ratings_total", 0),
            "location": {
                "lat": place["geometry"]["location"]["lat"],
                "lng": place["geometry"]["location"]["lng"],
            },
            "open_now": place.get("opening_hours", {}).get("open_now"),
            "place_id": place.get("place_id"),
        }
        for place in data.get("results", [])
    ]
