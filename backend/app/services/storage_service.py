"""
Service layer for handling file uploads and management with a storage provider.
"""
import uuid
from typing import Literal
from fastapi import UploadFile, HTTPException, status
from supabase import create_client, Client
from app.core.config import settings

Bucket = Literal["pet-images", "medical-records", "prescriptions"]

class StorageService:
    """
    Manages all interactions with the cloud storage service (Supabase Storage).
    Handles file validation, uploading, and URL generation.
    """
    def __init__(self):
        self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    def _validate_file(self, file: UploadFile, max_size_mb: int, allowed_types: list[str]):
        """Validates file size and MIME type."""
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types are: {', '.join(allowed_types)}"
            )
        
        # Use file.size which is available in Starlette's UploadFile
        if file.size > max_size_mb * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds the limit of {max_size_mb} MB."
            )

    async def upload_file(
        self, 
        file: UploadFile, 
        bucket: Bucket,
        max_size_mb: int = 5,
        allowed_types: list[str] = None
    ) -> str:
        """
        Uploads a file to a specified bucket after validation.
        Returns the public URL of the uploaded file.
        """
        if allowed_types is None:
            allowed_types = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

        self._validate_file(file, max_size_mb, allowed_types)

        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        try:
            # Supabase client needs bytes
            contents = await file.read()
            self.client.storage.from_(bucket).upload(
                path=unique_filename,
                file=contents,
                file_options={"content-type": file.content_type}
            )
        except Exception as e:
            # In a real app, log this error
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {e}"
            )

        # Get public URL
        public_url = self.client.storage.from_(bucket).get_public_url(unique_filename)
        return public_url

    def get_signed_url(self, bucket: Bucket, file_path: str, expires_in: int = 3600) -> str:
        """Generates a temporary, signed URL for a private file."""
        try:
            response = self.client.storage.from_(bucket).create_signed_url(file_path, expires_in)
            return response['signedURL']
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not generate signed URL: {e}")