import uuid
from src.application.common.uow import AbstractUnitOfWork
from src.application.users.dtos import (
    LoginDTO,
    RefreshTokenDTO,
    RegisterUserDTO,
    TokenResponseDTO,
    UserResponseDTO
)
from src.core.config import get_settings
from src.domain.common.exceptions import (
    EntityAlreadyExistsError,
    EntityNotFoundError,
    InvalidCredentialsError,
    InvalidTokenError
)
from src.domain.common.value_objects import EmailAddress
from src.domain.users.user_entity import User, UserRole
from src.infrastructure.security.jwt_handler import JWTHandlerInterface
from src.infrastructure.security.password_hasher import PasswordHasherInterface

settings = get_settings()


class RegisterUserUseCase:
    """
    Use case for registering a new Citizen account.
    """
    def __init__(
        self,
        uow: AbstractUnitOfWork,
        hasher: PasswordHasherInterface
    ):
        self.uow = uow
        self.hasher = hasher

    async def execute(self, dto: RegisterUserDTO) -> UserResponseDTO:
        async with self.uow:
            existing_user = await self.uow.users.get_by_email(dto.email)
            if existing_user:
                raise EntityAlreadyExistsError("User", "email", dto.email)

            hashed_pwd = self.hasher.hash_password(dto.password)
            email_vo = EmailAddress(dto.email)

            user = User(
                email=email_vo,
                password_hash=hashed_pwd,
                full_name=dto.full_name,
                role=UserRole.CITIZEN,
                phone_number=dto.phone_number,
                is_active=True
            )

            saved_user = await self.uow.users.save(user)
            await self.uow.commit()

            return UserResponseDTO(
                id=saved_user.id,
                email=saved_user.email.value,
                full_name=saved_user.full_name,
                role=saved_user.role,
                phone_number=saved_user.phone_number,
                is_active=saved_user.is_active,
                created_at=saved_user.created_at
            )


class AuthenticateUserUseCase:
    """
    Use case for authenticating user credentials and issuing JWT token pairs.
    """
    def __init__(
        self,
        uow: AbstractUnitOfWork,
        hasher: PasswordHasherInterface,
        jwt_handler: JWTHandlerInterface
    ):
        self.uow = uow
        self.hasher = hasher
        self.jwt_handler = jwt_handler

    async def execute(self, dto: LoginDTO) -> TokenResponseDTO:
        async with self.uow:
            user = await self.uow.users.get_by_email(dto.email)
            if not user or not user.is_active:
                raise InvalidCredentialsError("Invalid email or password.")

            if not self.hasher.verify_password(dto.password, user.password_hash):
                raise InvalidCredentialsError("Invalid email or password.")

            claims = {
                "role": user.role.value,
                "email": user.email.value
            }

            access_token = self.jwt_handler.create_access_token(
                subject=str(user.id),
                claims=claims
            )
            refresh_token = self.jwt_handler.create_refresh_token(subject=str(user.id))

            return TokenResponseDTO(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="Bearer",
                expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )


class RefreshTokenUseCase:
    """
    Use case for exchanging a valid Refresh Token for a new Access Token.
    """
    def __init__(
        self,
        uow: AbstractUnitOfWork,
        jwt_handler: JWTHandlerInterface
    ):
        self.uow = uow
        self.jwt_handler = jwt_handler

    async def execute(self, dto: RefreshTokenDTO) -> TokenResponseDTO:
        payload = self.jwt_handler.decode_token(dto.refresh_token)
        if payload.get("type") != "refresh":
            raise InvalidTokenError("Token provided is not a refresh token.")

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise InvalidTokenError("Invalid token subject.")

        async with self.uow:
            user = await self.uow.users.get_by_id(uuid.UUID(user_id_str))
            if not user or not user.is_active:
                raise InvalidCredentialsError("User account disabled or not found.")

            claims = {
                "role": user.role.value,
                "email": user.email.value
            }

            new_access_token = self.jwt_handler.create_access_token(
                subject=str(user.id),
                claims=claims
            )
            new_refresh_token = self.jwt_handler.create_refresh_token(subject=str(user.id))

            return TokenResponseDTO(
                access_token=new_access_token,
                refresh_token=new_refresh_token,
                token_type="Bearer",
                expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )


class GetCurrentUserUseCase:
    """
    Use case for fetching current authenticated user profile.
    """
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(self, user_id: uuid.UUID) -> UserResponseDTO:
        async with self.uow:
            user = await self.uow.users.get_by_id(user_id)
            if not user:
                raise EntityNotFoundError("User", str(user_id))

            return UserResponseDTO(
                id=user.id,
                email=user.email.value,
                full_name=user.full_name,
                role=user.role,
                phone_number=user.phone_number,
                is_active=user.is_active,
                created_at=user.created_at
            )
