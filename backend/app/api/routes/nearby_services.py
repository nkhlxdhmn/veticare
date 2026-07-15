"""Nearby veterinary services HTTP endpoints."""

import logging

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.nearby import NearbyResponse, NearbyService
from app.services.nearby_services import search_nearby_vet_services

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/services", tags=["services"])


@router.get("/nearby", response_model=NearbyResponse)
async def get_nearby_services(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude"),
    radius: int = Query(default=5000, ge=100, le=50000, description="Search radius in meters"),
) -> NearbyResponse:
    """Return nearby veterinary care services from Google Places."""
    try:
        places = await search_nearby_vet_services(latitude, longitude, radius)
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Places API key is not configured",
        )
    except Exception:
        logger.exception("Google Places request failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch nearby services",
        )

    return NearbyResponse(
        services=[NearbyService(**place) for place in places],
        count=len(places),
    )
