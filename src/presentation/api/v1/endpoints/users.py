import uuid
from fastapi import APIRouter, Depends, File, UploadFile, status
from src.application.common.uow import AbstractUnitOfWork
from src.application.users.dtos import (
    ChangePasswordDTO,
    UpdateUserProfileDTO,
    UserResponseDTO
)
from src.application.users.use_cases import (
    ChangePasswordUseCase,
    GetCurrentUserUseCase,
    UpdateUserProfileUseCase,
    UploadAvatarUseCase
)
from src.domain.users.user_entity import UserRole
from src.infrastructure.security.password_hasher import BcryptPasswordHasher
from src.infrastructure.storage.interface import StorageAdapterInterface
from src.presentation.api.dependencies import (
    RoleChecker,
    get_current_user_claims,
    get_password_hasher,
    get_storage_adapter,
    get_uow
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponseDTO, status_code=status.HTTP_200_OK)
async def get_current_user_profile(
    claims: dict = Depends(get_current_user_claims),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """
    Returns current authenticated user profile details.
    """
    user_id = uuid.UUID(claims["sub"])
    use_case = GetCurrentUserUseCase(uow=uow)
    return await use_case.execute(user_id)


@router.patch("/me", response_model=UserResponseDTO, status_code=status.HTTP_200_OK)
async def update_current_user_profile(
    dto: UpdateUserProfileDTO,
    claims: dict = Depends(get_current_user_claims),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """
    Updates current user's profile details (full_name, phone_number).
    """
    user_id = uuid.UUID(claims["sub"])
    use_case = UpdateUserProfileUseCase(uow=uow)
    return await use_case.execute(user_id=user_id, dto=dto)


@router.post("/me/avatar", response_model=UserResponseDTO, status_code=status.HTTP_200_OK)
async def upload_user_avatar(
    file: UploadFile = File(...),
    claims: dict = Depends(get_current_user_claims),
    uow: AbstractUnitOfWork = Depends(get_uow),
    storage: StorageAdapterInterface = Depends(get_storage_adapter)
):
    """
    Uploads and updates current user's profile avatar photo.
    """
    user_id = uuid.UUID(claims["sub"])
    file_bytes = await file.read()
    file_name = file.filename or "avatar.jpg"
    mime_type = file.content_type or "image/jpeg"

    use_case = UploadAvatarUseCase(uow=uow, storage=storage)
    return await use_case.execute(
        user_id=user_id,
        file_bytes=file_bytes,
        file_name=file_name,
        mime_type=mime_type
    )


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
async def change_user_password(
    dto: ChangePasswordDTO,
    claims: dict = Depends(get_current_user_claims),
    uow: AbstractUnitOfWork = Depends(get_uow),
    hasher: BcryptPasswordHasher = Depends(get_password_hasher)
):
    """
    Changes current user password after verifying existing password.
    """
    user_id = uuid.UUID(claims["sub"])
    use_case = ChangePasswordUseCase(uow=uow, hasher=hasher)
    await use_case.execute(user_id=user_id, dto=dto)
    return {"message": "Password updated successfully."}


@router.get("/official-only-demo", status_code=status.HTTP_200_OK)
async def official_rbac_demo(
    claims: dict = Depends(RoleChecker([UserRole.OFFICIAL, UserRole.ADMIN]))
):
    """
    RBAC Protected endpoint example: Requires OFFICIAL or ADMIN role.
    """
    return {
        "message": "Welcome, Official/Admin! RBAC verification passed.",
        "user_id": claims["sub"],
        "role": claims["role"]
    }
