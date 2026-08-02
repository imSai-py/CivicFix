from typing import List
from fastapi import APIRouter, Depends, status
from src.application.common.uow import AbstractUnitOfWork
from src.application.issues.dtos import CategoryResponseDTO
from src.application.issues.use_cases import ListCategoriesUseCase
from src.presentation.api.dependencies import get_uow

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponseDTO], status_code=status.HTTP_200_OK)
async def list_categories(uow: AbstractUnitOfWork = Depends(get_uow)):
    """
    Retrieves all active issue categories.
    """
    use_case = ListCategoriesUseCase(uow=uow)
    return await use_case.execute()
