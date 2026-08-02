import uuid
from fastapi import APIRouter, Depends, status
from src.application.common.uow import AbstractUnitOfWork
from src.application.users.dtos import UserResponseDTO
from src.application.users.use_cases import GetCurrentUserUseCase
from src.domain.users.user_entity import UserRole
from src.presentation.api.dependencies import (
    RoleChecker,
    get_current_user_claims,
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
