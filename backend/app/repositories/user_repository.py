"""
Repository for user-related database operations.
"""
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate

class UserRepository:
    """
    This class handles all database operations related to the User model.
    """

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """Retrieve a user by their email address."""
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        """Retrieve a user by their username."""
        result = await db.execute(select(User).filter(User.username == username))
        return result.scalars().first()

    async def create(self, db: AsyncSession, user_in: UserCreate, hashed_password: str) -> User:
        """Create a new user in the database."""
        db_user = User(**user_in.model_dump(exclude={"password"}), hashed_password=hashed_password)
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user