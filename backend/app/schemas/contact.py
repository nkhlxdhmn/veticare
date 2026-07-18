from pydantic import BaseModel, EmailStr


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactResponse(BaseModel):
    success: bool
    message: str = "Message received. We'll get back to you within 48 hours."
