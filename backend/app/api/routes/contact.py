from fastapi import APIRouter, status

from app.schemas.contact import ContactRequest, ContactResponse

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact(body: ContactRequest) -> ContactResponse:
    return ContactResponse(success=True)
