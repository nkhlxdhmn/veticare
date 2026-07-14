"""
Placeholder for authentication routes (e.g., login, register).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends()
):
    """Register a new user."""
    await auth_service.register_user(user_in=user_in, db=db)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends()
):
    """Login to get an access token."""
    access_token = await auth_service.login_user(
        email=form_data.username, password=form_data.password, db=db
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    """Get the current authenticated user's profile."""
    return current_user