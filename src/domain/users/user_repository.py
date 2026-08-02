from abc import ABC, abstractmethod
from typing import Optional
import uuid
from src.domain.users.user_entity import User


class UserRepositoryInterface(ABC):
    """
    Abstract UserRepository Contract (Port).
    Defines database persistence contract for User entities.
    """

    @abstractmethod
    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """Fetch user by unique UUID."""
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        """Fetch user by unique email address."""
        pass

    @abstractmethod
    async def save(self, user: User) -> User:
        """Persist new or updated User domain entity."""
        pass
