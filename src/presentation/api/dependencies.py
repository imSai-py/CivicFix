from typing import List
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from src.application.common.uow import AbstractUnitOfWork
from src.core.config import get_settings
from src.core.database import get_db_session
from src.domain.common.exceptions import InvalidTokenError, UnauthorizedAccessError
from src.domain.users.user_entity import UserRole
from src.infrastructure.persistence.unit_of_work_impl import SQLAlchemyUnitOfWork
from src.infrastructure.security.jwt_handler import JWTHandlerInterface, PyJWTHandler
from src.infrastructure.security.password_hasher import BcryptPasswordHasher, PasswordHasherInterface
from src.infrastructure.storage.interface import StorageAdapterInterface
from src.infrastructure.storage.local_storage import LocalStorageAdapter

settings = get_settings()
security_scheme = HTTPBearer()


def get_password_hasher() -> PasswordHasherInterface:
    return BcryptPasswordHasher()


def get_jwt_handler() -> JWTHandlerInterface:
    return PyJWTHandler()


def get_storage_adapter() -> StorageAdapterInterface:
    return LocalStorageAdapter(base_upload_dir=settings.MEDIA_UPLOAD_DIR)


def get_uow(session: AsyncSession = Depends(get_db_session)) -> AbstractUnitOfWork:
    return SQLAlchemyUnitOfWork(session)


async def get_current_user_claims(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    jwt_handler: JWTHandlerInterface = Depends(get_jwt_handler)
) -> dict:
    token = credentials.credentials
    payload = jwt_handler.decode_token(token)
    if payload.get("type") != "access":
        raise InvalidTokenError("Token provided is not an access token.")
    return payload


class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = [r.value for r in allowed_roles]

    def __call__(self, claims: dict = Depends(get_current_user_claims)) -> dict:
        user_role = claims.get("role")
        if user_role not in self.allowed_roles:
            raise UnauthorizedAccessError(f"Role '{user_role}' is not authorized for this operation.")
        return claims
