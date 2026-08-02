from typing import Self
from sqlalchemy.ext.asyncio import AsyncSession
from src.application.common.uow import AbstractUnitOfWork
from src.infrastructure.persistence.repositories.issue_repository_impl import IssueRepositoryImpl
from src.infrastructure.persistence.repositories.user_repository_impl import UserRepositoryImpl


class SQLAlchemyUnitOfWork(AbstractUnitOfWork):
    """
    Concrete SQLAlchemy 2.0 Async Session Unit of Work.
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def __aenter__(self) -> Self:
        self.users = UserRepositoryImpl(self.session)
        self.issues = IssueRepositoryImpl(self.session)
        return await super().__aenter__()

    async def commit(self) -> None:
        await self.session.commit()

    async def rollback(self) -> None:
        await self.session.rollback()
