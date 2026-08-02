from fastapi import APIRouter, Depends, status
from src.application.common.uow import AbstractUnitOfWork
from src.application.users.dtos import (
    LoginDTO,
    RefreshTokenDTO,
    RegisterUserDTO,
    TokenResponseDTO,
    UserResponseDTO
)
from src.application.users.use_cases import (
    AuthenticateUserUseCase,
    RefreshTokenUseCase,
    RegisterUserUseCase
)
from src.presentation.api.dependencies import (
    get_jwt_handler,
    get_password_hasher,
    get_uow
)
from src.infrastructure.security.jwt_handler import JWTHandlerInterface
from src.infrastructure.security.password_hasher import PasswordHasherInterface

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponseDTO, status_code=status.HTTP_201_CREATED)
async def register_user(
    dto: RegisterUserDTO,
    uow: AbstractUnitOfWork = Depends(get_uow),
    hasher: PasswordHasherInterface = Depends(get_password_hasher)
):
    """
    Registers a new Citizen account.
    """
    use_case = RegisterUserUseCase(uow=uow, hasher=hasher)
    return await use_case.execute(dto)


@router.post("/login", response_model=TokenResponseDTO, status_code=status.HTTP_200_OK)
async def login_user(
    dto: LoginDTO,
    uow: AbstractUnitOfWork = Depends(get_uow),
    hasher: PasswordHasherInterface = Depends(get_password_hasher),
    jwt_handler: JWTHandlerInterface = Depends(get_jwt_handler)
):
    """
    Authenticates user credentials and issues JWT Access & Refresh Token pair.
    """
    use_case = AuthenticateUserUseCase(uow=uow, hasher=hasher, jwt_handler=jwt_handler)
    return await use_case.execute(dto)


@router.post("/refresh", response_model=TokenResponseDTO, status_code=status.HTTP_200_OK)
async def refresh_token(
    dto: RefreshTokenDTO,
    uow: AbstractUnitOfWork = Depends(get_uow),
    jwt_handler: JWTHandlerInterface = Depends(get_jwt_handler)
):
    """
    Exchanges a valid Refresh Token for a new Access Token.
    """
    use_case = RefreshTokenUseCase(uow=uow, jwt_handler=jwt_handler)
    return await use_case.execute(dto)
