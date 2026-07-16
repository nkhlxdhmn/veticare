"""OpenStreetMap nearby search service using Overpass API and Nominatim."""

from __future__ import annotations

import logging
from functools import lru_cache
from time import time

import httpx

logger = logging.getLogger(__name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"

OSM_TYPE_MAP = {
    "veterinary": "Veterinary Clinic",
    "pet_shop": "Pet Shop",
    "pet_food": "Pet Food Store",
    "animal_hospital": "Animal Hospital",
    "ngo": "NGO",
    "animal_shelter": "Animal Shelter",
}

OVERPASS_TYPE_MAP = {
    "veterinary": 'node["amenity"="veterinary"];way["amenity"="veterinary"];',
    "pet_shop": 'node["shop"="pet"];way["shop"="pet"];',
    "pet_food": 'node["shop"="pet_food"];way["shop"="pet_food"];',
    "animal_hospital": 'node["amenity"="animal_hospital"];way["amenity"="animal_hospital"];',
    "ngo": 'node["amenity"="animal_shelter"]["ngo"="yes"];way["amenity"="animal_shelter"]["ngo"="yes"];',
    "animal_shelter": 'node["amenity"="animal_shelter"];way["amenity"="animal_shelter"];',
}

_cache: dict[str, tuple[float, list[dict]]] = {}
CACHE_TTL = 300  # 5 minutes


def _make_cache_key(prefix: str, *args) -> str:
    return f"{prefix}:{':'.join(str(a) for a in args)}"


async def search_places(query: str, limit: int = 5) -> list[dict]:
    """Search for places using Nominatim."""
    cache_key = _make_cache_key("search", query, str(limit))
    cached = _cache.get(cache_key)
    if cached and (time() - cached[0]) < CACHE_TTL:
        return cached[1]

    params = {"q": query, "format": "json", "limit": limit, "addressdetails": 1}
    headers = {"User-Agent": "VetiCare/1.0"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(NOMINATIM_SEARCH_URL, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as e:
        logger.error("Nominatim search failed: %s", e)
        return []

    results = [
        {
            "osm_id": item.get("osm_id"),
            "osm_type": item.get("osm_type"),
            "name": item.get("display_name", "").split(",")[0],
            "display_name": item.get("display_name", ""),
            "lat": float(item["lat"]),
            "lng": float(item["lon"]),
            "type": item.get("type", ""),
            "category": item.get("category", ""),
        }
        for item in data
    ]
    _cache[cache_key] = (time(), results)
    return results


async def reverse_geocode(lat: float, lng: float) -> dict | None:
    """Reverse geocode coordinates to address using Nominatim."""
    cache_key = _make_cache_key("geocode", str(lat), str(lng))
    cached = _cache.get(cache_key)
    if cached and (time() - cached[0]) < CACHE_TTL:
        return cached[1]

    params = {"lat": lat, "lon": lng, "format": "json", "addressdetails": 1}
    headers = {"User-Agent": "VetiCare/1.0"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(NOMINATIM_REVERSE_URL, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as e:
        logger.error("Nominatim reverse geocode failed: %s", e)
        return None

    if "error" in data:
        return None

    result = {
        "osm_id": data.get("osm_id"),
        "osm_type": data.get("osm_type"),
        "display_name": data.get("display_name", ""),
        "lat": float(data["lat"]),
        "lng": float(data["lon"]),
        "address": data.get("address", {}),
    }
    _cache[cache_key] = (time(), result)
    return result


async def search_nearby_osm(
    latitude: float,
    longitude: float,
    radius: int = 5000,
    place_type: str = "veterinary",
) -> list[dict]:
    """Query Overpass API for nearby places matching the given type.

    Args:
        latitude: Search center latitude.
        longitude: Search center longitude.
        radius: Search radius in meters (max 50000).
        place_type: One of: veterinary, pet_shop, pet_food, animal_hospital, ngo, animal_shelter.

    Returns:
        List of formatted place dicts.
    """
    cache_key = _make_cache_key("nearby", str(latitude), str(longitude), str(radius), place_type)
    cached = _cache.get(cache_key)
    if cached and (time() - cached[0]) < CACHE_TTL:
        return cached[1]

    overpass_query = OVERPASS_TYPE_MAP.get(place_type, OVERPASS_TYPE_MAP["veterinary"])
    query = f"""
    [out:json];
    (
      {overpass_query}
    )(around:{min(radius, 50000)},{latitude},{longitude});
    out center;
    """

    headers = {"Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded"}
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(OVERPASS_URL, data={"data": query}, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as e:
        logger.error("Overpass API request failed: %s", e)
        return []

    elements = data.get("elements", [])
    places = []
    for elem in elements:
        lat = elem.get("lat") or elem.get("center", {}).get("lat")
        lng = elem.get("lon") or elem.get("center", {}).get("lon")
        if lat is None or lng is None:
            continue

        tags = elem.get("tags", {})
        name = tags.get("name", tags.get("operator", "Unnamed"))
        address_parts = []
        if tags.get("addr:street"):
            address_parts.append(tags["addr:street"])
            if tags.get("addr:housenumber"):
                address_parts[-1] = tags["addr:housenumber"] + " " + address_parts[-1]
        if tags.get("addr:city"):
            address_parts.append(tags["addr:city"])
        address = ", ".join(address_parts) if address_parts else tags.get("addr:full", "")

        places.append({
            "osm_id": elem.get("id"),
            "osm_type": elem.get("type"),
            "name": name,
            "address": address,
            "lat": float(lat),
            "lng": float(lng),
            "type": place_type,
            "type_label": OSM_TYPE_MAP.get(place_type, place_type),
            "phone": tags.get("phone", tags.get("contact:phone", "")),
            "website": tags.get("website", tags.get("contact:website", "")),
            "opening_hours": tags.get("opening_hours", ""),
        })

    _cache[cache_key] = (time(), places)
    return places
