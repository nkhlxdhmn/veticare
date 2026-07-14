"""
Service layer for authentication-related business logic.
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import security
from app.database.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate

class AuthService:
    """
    Orchestrates authentication logic, coordinating between the API layer
    and the data access layer (repository).
    """
    def __init__(self, user_repo: UserRepository = Depends()):
        self.user_repo = user_repo

    async def register_user(self, user_in: UserCreate, db: AsyncSession) -> User:
        """Registers a new user after validating input."""
        # Check for duplicate email
        existing_user = await self.user_repo.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        # Check for duplicate username
        existing_user_by_username = await self.user_repo.get_by_username(db, username=user_in.username)
        if existing_user_by_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )

        hashed_password = security.get_password_hash(user_in.password)
        return await self.user_repo.create(db, user_in=user_in, hashed_password=hashed_password)

    async def login_user(self, email: str, password: str, db: AsyncSession) -> str:
        """Authenticates a user and returns a JWT."""
        user = await self.user_repo.get_by_email(db, email=email)
        if not user or not security.verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

        access_token = security.create_access_token(data={"sub": str(user.id)})
        return access_token