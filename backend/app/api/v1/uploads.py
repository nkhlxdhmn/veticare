"""
API endpoints for file uploads.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.services.storage_service import StorageService
from app.services.pet_service import PetService

router = APIRouter()

@router.post("/pet-image")
async def upload_pet_image(
    pet_id: UUID = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    storage_service: StorageService = Depends(),
    pet_service: PetService = Depends(),
):
    """
    Uploads a profile image for a specific pet.
    - Validates ownership.
    - Uploads file to 'pet-images' bucket.
    - Updates the pet's `image_url` field.
    """
    # 1. Verify the user owns the pet
    pet = await pet_service.get_pet_by_id(db, pet_id=pet_id, owner_id=current_user.id)

    # 2. Upload the file
    public_url = await storage_service.upload_file(
        file=file,
        bucket="pet-images",
        allowed_types=["image/jpeg", "image/png", "image/webp"]
    )

    # 3. Update the pet record with the new URL
    pet.image_url = public_url
    await db.commit()

    return {"message": "Pet image uploaded successfully", "image_url": public_url}