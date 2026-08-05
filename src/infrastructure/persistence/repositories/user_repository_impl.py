from typing import Optional
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.users.user_entity import User
from src.domain.users.user_repository import UserRepositoryInterface
from src.infrastructure.persistence.models.user_model import UserModel


class UserRepositoryImpl(UserRepositoryInterface):
    """
    SQLAlchemy 2.0 Async repository implementation for User domain entity.
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        stmt = select(UserModel).where(UserModel.id == user_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return model.to_domain() if model else None

    async def get_by_email(self, email: str) -> Optional[User]:
        clean_email = email.strip().lower()
        stmt = select(UserModel).where(UserModel.email == clean_email)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return model.to_domain() if model else None

    async def save(self, user: User) -> User:
        stmt = select(UserModel).where(UserModel.id == user.id)
        result = await self.session.execute(stmt)
        existing_model = result.scalar_one_or_none()

        if existing_model:
            existing_model.email = user.email.value
            existing_model.password_hash = user.password_hash
            existing_model.full_name = user.full_name
            existing_model.role = user.role
            existing_model.phone_number = user.phone_number
            existing_model.is_active = user.is_active
            existing_model.xp_points = user.xp_points
            existing_model.reputation_rank = user.reputation_rank
            existing_model.updated_at = user.updated_at
            target_model = existing_model
        else:
            target_model = UserModel.from_domain(user)
            self.session.add(target_model)

        await self.session.flush()
        return target_model.to_domain()
