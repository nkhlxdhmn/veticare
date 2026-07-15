"""ETL script to import real Veterinary Clinics and Animal Shelters from OpenStreetMap."""

import asyncio
import os
import sys
from uuid import uuid4

import httpx
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.health_centre import HealthCentre
from app.models.ngo import NGO
from app.models.role import UserRole
from app.models.user import User


OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Target a major metropolitan area for good data density (e.g., London, UK as a test case)
# Bounding box format: (south, west, north, east)
BOUNDING_BOX = "51.38,-0.35,51.68,0.15" # Greater London

def build_overpass_query() -> str:
    """Builds the Overpass QL query to fetch vet clinics and animal shelters."""
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="veterinary"]({BOUNDING_BOX});
      node["amenity"="animal_shelter"]({BOUNDING_BOX});
    );
    out body;
    >;
    out skel qt;
    """
    return query


async def fetch_osm_data() -> list[dict]:
    """Fetches data from Overpass API."""
    print(f"Fetching data from OpenStreetMap (Overpass API) for bounding box: {BOUNDING_BOX}...")
    query = build_overpass_query()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        headers = {
            "Accept": "*/*",
            "User-Agent": "VetiCare/1.0 (local dev script)"
        }
        response = await client.post(OVERPASS_URL, data={"data": query}, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get("elements", [])


async def create_system_admin(db: AsyncSession) -> User:
    """Creates or retrieves a System Admin user to act as the owner of imported clinics/NGOs."""
    # We create a dummy user to own these imported entities to satisfy the Foreign Key constraint
    sys_admin_email = "system.import@veticare.com"
    
    # Check if exists
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.email == sys_admin_email))
    admin = result.scalar_one_or_none()
    
    if not admin:
        print("Creating system import user...")
        admin = User(
            email=sys_admin_email,
            username="system_import",
            hashed_password=get_password_hash("SuperSecret123!"),
            first_name="System",
            last_name="Import",
            role=UserRole.SUPER_ADMIN,
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        
    return admin


async def create_clinic_admin(db: AsyncSession, name: str) -> User:
    """Creates a dedicated user for a clinic to satisfy 1-to-1 relationship constraints."""
    username = f"clinic_{uuid4().hex[:8]}"
    admin = User(
        email=f"{username}@veticare.com",
        username=username,
        hashed_password=get_password_hash("Secret123!"),
        first_name="Clinic",
        last_name="Admin",
        role=UserRole.CLINIC_ADMIN,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin


async def create_ngo_admin(db: AsyncSession, name: str) -> User:
    """Creates a dedicated user for an NGO to satisfy 1-to-1 relationship constraints."""
    username = f"ngo_{uuid4().hex[:8]}"
    admin = User(
        email=f"{username}@veticare.com",
        username=username,
        hashed_password=get_password_hash("Secret123!"),
        first_name="NGO",
        last_name="Admin",
        role=UserRole.NGO_ADMIN,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin


async def import_data(db: AsyncSession, elements: list[dict]):
    """Parses OSM elements and inserts them into PostgreSQL."""
    clinics_added = 0
    ngos_added = 0
    
    for element in elements:
        if element.get("type") != "node":
            continue
            
        tags = element.get("tags", {})
        if not tags:
            continue
            
        amenity = tags.get("amenity")
        name = tags.get("name", "Unnamed Facility")
        
        # Skip generic unnamed ones
        if name == "Unnamed Facility":
            continue

        lat = element.get("lat")
        lon = element.get("lon")
        
        address_parts = [
            tags.get("addr:housenumber", ""),
            tags.get("addr:street", ""),
        ]
        address = " ".join(filter(None, address_parts)) or "Address not provided"
        city = tags.get("addr:city", "London") # Defaulting based on bounding box
        state = tags.get("addr:state", "England")
        phone = tags.get("phone", tags.get("contact:phone", "N/A"))
        
        try:
            if amenity == "veterinary":
                # Check if it exists
                from sqlalchemy import select
                existing = await db.execute(select(HealthCentre).where(HealthCentre.name == name))
                if existing.scalar_one_or_none():
                    continue

                admin = await create_clinic_admin(db, name)
                
                clinic = HealthCentre(
                    user_id=admin.id,
                    name=name,
                    description=tags.get("description", "A veterinary health centre imported from OpenStreetMap."),
                    address=address,
                    city=city,
                    state=state,
                    contact_number=phone,
                    location_lat=lat,
                    location_lng=lon,
                    facilities=["General Consultation", "Vaccination", "Surgery"] if tags.get("healthcare:speciality") else ["General Consultation"],
                    emergency_services="emergency" in tags,
                )
                db.add(clinic)
                clinics_added += 1
                
            elif amenity == "animal_shelter":
                # Check if it exists
                from sqlalchemy import select
                existing = await db.execute(select(NGO).where(NGO.name == name))
                if existing.scalar_one_or_none():
                    continue

                admin = await create_ngo_admin(db, name)
                
                ngo = NGO(
                    user_id=admin.id,
                    name=name,
                    description=tags.get("description", "An animal shelter imported from OpenStreetMap."),
                    address=address,
                    city=city,
                    state=state,
                    emergency_contact=phone,
                    location_lat=lat,
                    location_lng=lon,
                    services=["Animal Rescue", "Adoption", "Shelter"],
                )
                db.add(ngo)
                ngos_added += 1
                
        except Exception as e:
            print(f"Error inserting {name}: {e}")
            await db.rollback()
            continue

    try:
        await db.commit()
    except Exception as e:
        print(f"Final commit failed: {e}")
        await db.rollback()
        
    print(f"Import Complete! Added {clinics_added} Veterinary Clinics and {ngos_added} Animal Shelters/NGOs.")


async def main():
    engine = create_async_engine(settings.database_url, pool_pre_ping=True)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )
    
    elements = await fetch_osm_data()
    print(f"Fetched {len(elements)} raw elements from OSM.")
    
    async with async_session() as db:
        await import_data(db, elements)


if __name__ == "__main__":
    asyncio.run(main())
