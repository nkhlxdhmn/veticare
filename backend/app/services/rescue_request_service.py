"""Rescue request service layer."""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.rescue_request_repository import RescueRequestRepository
from app.repositories.ngo_repository import NGORepository
from app.schemas.rescue_request import RescueRequestCreate, RescueRequestUpdate, RescueRequestResponse


class RescueRequestService:
    """Service for managing Rescue Requests."""
    
    def __init__(
        self, 
        rescue_repo: RescueRequestRepository = Depends(),
        ngo_repo: NGORepository = Depends()
    ) -> None:
        self.rescue_repo = rescue_repo
        self.ngo_repo = ngo_repo

    async def get_all_for_owner(self, db: AsyncSession, user_id: UUID) -> list[RescueRequestResponse]:
        requests = await self.rescue_repo.get_all_for_owner(db, user_id=user_id)
        return [RescueRequestResponse.model_validate(req) for req in requests]



    async def get_pending_requests(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> list[RescueRequestResponse]:
        requests = await self.rescue_repo.get_pending_requests(db, skip=skip, limit=limit)
        return [RescueRequestResponse.model_validate(req) for req in requests]

    async def create(self, db: AsyncSession, request_in: RescueRequestCreate, user_id: UUID) -> RescueRequestResponse:
        request_in.user_id = user_id
        req = await self.rescue_repo.create(db, obj_in=request_in)
        return RescueRequestResponse.model_validate(req)

    async def update_status(self, db: AsyncSession, id: UUID, status_update: str, ngo_id: UUID = None) -> RescueRequestResponse:
        req = await self.rescue_repo.get_by_id(db, id=id)
        if not req:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rescue request not found")

        update_data = RescueRequestUpdate(status=status_update)
        if status_update == "ACCEPTED" and ngo_id:
            update_data.ngo_id = ngo_id
            
        updated_req = await self.rescue_repo.update(db, db_obj=req, obj_in=update_data)
        return RescueRequestResponse.model_validate(updated_req)
