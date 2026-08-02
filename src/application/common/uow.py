from abc import ABC, abstractmethod
from typing import Self
from src.domain.issues.issue_repository import IssueRepositoryInterface
from src.domain.users.user_repository import UserRepositoryInterface


class AbstractUnitOfWork(ABC):
    """
    Abstract Unit of Work Contract.
    Manages transaction lifecycles across multiple repositories.
    """
    users: UserRepositoryInterface
    issues: IssueRepositoryInterface

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        if exc_type is not None:
            await self.rollback()
        else:
            await self.commit()

    @abstractmethod
    async def commit(self) -> None:
        """Commit active database transaction."""
        pass

    @abstractmethod
    async def rollback(self) -> None:
        """Rollback active database transaction."""
        pass
