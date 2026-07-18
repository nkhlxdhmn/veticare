"""OpenStreetMap nearby search service using Overpass API and Nominatim."""

from __future__ import annotations

import asyncio
import logging
import random
from functools import lru_cache
from time import time

import httpx

logger = logging.getLogger(__name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"

USER_AGENT = "VetiCare/1.0"

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

_cache: dict[str, tuple[float, list[dict] | dict]] = {}
CACHE_TTL = 300

OVERPASS_TIMEOUT = 60.0
OVERPASS_MAX_RETRIES = 3
OVERPASS_BASE_DELAY = 1.0


def _make_cache_key(prefix: str, *args) -> str:
    return f"{prefix}:{':'.join(str(a) for a in args)}"


async def search_places(query: str, limit: int = 5) -> list[dict]:
    """Search for places using Nominatim."""
    cache_key = _make_cache_key("search", query, str(limit))
    cached = _cache.get(cache_key)
    if cached and (time() - cached[0]) < CACHE_TTL:
        return cached[1]

    params = {"q": query, "format": "json", "limit": limit, "addressdetails": 1}
    headers = {"User-Agent": USER_AGENT}
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
    headers = {"User-Agent": USER_AGENT}
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


def _build_overpass_query(place_type: str, radius: int, lat: float, lon: float) -> str:
    """Build an Overpass QL query with around filter applied to each statement."""
    overpass_query = OVERPASS_TYPE_MAP.get(place_type, OVERPASS_TYPE_MAP["veterinary"])
    radius = min(radius, 50000)

    statements = []
    for stmt in overpass_query.strip().rstrip(";").split(";"):
        stmt = stmt.strip()
        if stmt:
            statements.append(f"{stmt}(around:{radius},{lat},{lon});")

    joined = "\n      ".join(statements)
    return f"[out:json];\n    (\n      {joined}\n    );\n    out center;"


async def _call_overpass_with_retry(query: str) -> dict:
    """Call Overpass API with retries and exponential backoff."""
    body = f"data={query}"

    logger.info("Overpass query:\n%s", query)
    logger.info("Overpass request body: data=<query> (%d chars)", len(query))

    headers = {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
    }

    last_error: Exception | None = None

    for attempt in range(1, OVERPASS_MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=OVERPASS_TIMEOUT) as client:
                response = await client.post(OVERPASS_URL, content=body, headers=headers)

            logger.info(
                "Overpass attempt %d/%d: status=%d",
                attempt, OVERPASS_MAX_RETRIES, response.status_code,
            )

            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", str(OVERPASS_BASE_DELAY * (2 ** attempt))))
                logger.warning(
                    "Overpass rate limited (429). Retrying after %ds (attempt %d/%d)",
                    retry_after, attempt, OVERPASS_MAX_RETRIES,
                )
                if attempt < OVERPASS_MAX_RETRIES:
                    await asyncio.sleep(retry_after)
                    continue
                return {"elements": []}

            if response.status_code == 400:
                logger.error("Overpass bad request (400). Response body: %s", response.text[:500])
                return {"elements": []}

            if response.status_code == 406:
                logger.error(
                    "Overpass not acceptable (406). User-agent or Accept header rejected. Response: %s",
                    response.text[:300],
                )
                return {"elements": []}

            if response.status_code >= 500:
                logger.error(
                    "Overpass server error (%d). Attempt %d/%d. Response: %s",
                    response.status_code, attempt, OVERPASS_MAX_RETRIES, response.text[:300],
                )
                if attempt < OVERPASS_MAX_RETRIES:
                    delay = OVERPASS_BASE_DELAY * (2 ** (attempt - 1)) + random.uniform(0, 1)
                    logger.info("Retrying in %.1fs", delay)
                    await asyncio.sleep(delay)
                    continue
                return {"elements": []}

            response.raise_for_status()
            data = response.json()
            element_count = len(data.get("elements", []))
            logger.info("Overpass success: %d elements returned", element_count)
            return data

        except httpx.TimeoutException:
            logger.error("Overpass timeout on attempt %d/%d", attempt, OVERPASS_MAX_RETRIES)
            last_error = None
            if attempt < OVERPASS_MAX_RETRIES:
                delay = OVERPASS_BASE_DELAY * (2 ** (attempt - 1)) + random.uniform(0, 1)
                await asyncio.sleep(delay)
        except httpx.HTTPError as e:
            logger.error("Overpass HTTP error on attempt %d/%d: %s", attempt, OVERPASS_MAX_RETRIES, e)
            last_error = e
            if attempt < OVERPASS_MAX_RETRIES:
                delay = OVERPASS_BASE_DELAY * (2 ** (attempt - 1)) + random.uniform(0, 1)
                await asyncio.sleep(delay)
            else:
                return {"elements": []}
        except Exception as e:
            logger.exception("Overpass unexpected error on attempt %d/%d: %s", attempt, OVERPASS_MAX_RETRIES, e)
            last_error = e
            if attempt < OVERPASS_MAX_RETRIES:
                delay = OVERPASS_BASE_DELAY * (2 ** (attempt - 1)) + random.uniform(0, 1)
                await asyncio.sleep(delay)
            else:
                return {"elements": []}

    logger.error("Overpass exhausted all %d retries", OVERPASS_MAX_RETRIES)
    return {"elements": []}


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

    query = _build_overpass_query(place_type, radius, latitude, longitude)
    data = await _call_overpass_with_retry(query)

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
