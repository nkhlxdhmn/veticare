"""NGO service layer."""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.ngo_repository import NGORepository
from app.schemas.ngo import NGOCreate, NGOUpdate, NGOResponse


class NGOService:
    """Service for managing NGOs."""
    
    def __init__(self, ngo_repo: NGORepository = Depends()) -> None:
        self.ngo_repo = ngo_repo

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> list[NGOResponse]:
        ngos = await self.ngo_repo.get_all(db, skip=skip, limit=limit)
        return [NGOResponse.model_validate(ngo) for ngo in ngos]

    async def get_by_id(self, db: AsyncSession, id: UUID) -> NGOResponse:
        ngo = await self.ngo_repo.get_by_id(db, id=id)
        if not ngo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NGO not found")
        return NGOResponse.model_validate(ngo)

    async def create(self, db: AsyncSession, ngo_in: NGOCreate) -> NGOResponse:
        ngo = await self.ngo_repo.create(db, obj_in=ngo_in)
        return NGOResponse.model_validate(ngo)

    async def update(self, db: AsyncSession, id: UUID, ngo_in: NGOUpdate) -> NGOResponse:
        ngo = await self.ngo_repo.get_by_id(db, id=id)
        if not ngo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NGO not found")
        
        updated_ngo = await self.ngo_repo.update(db, db_obj=ngo, obj_in=ngo_in)
        return NGOResponse.model_validate(updated_ngo)

    async def delete(self, db: AsyncSession, id: UUID) -> None:
        ngo = await self.ngo_repo.get_by_id(db, id=id)
        if not ngo:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NGO not found")
            
        await self.ngo_repo.delete(db, id=id)
