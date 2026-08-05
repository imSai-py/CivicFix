from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from src.application.common.uow import AbstractUnitOfWork
from src.application.issues.dtos import (
    ApproveReportDTO,
    AssignDepartmentDTO,
    AttachmentResponseDTO,
    AuditLogResponseDTO,
    CreateIssueDTO,
    GeoJSONFeatureCollectionDTO,
    IssueResponseDTO,
    PaginatedIssuesDTO,
    RateIssueDTO,
    RejectReportDTO,
    ReopenIssueDTO,
    UpdateIssueStatusDTO
)
from src.application.issues.use_cases import (
    ApproveIssueUseCase,
    AssignDepartmentUseCase,
    CreateIssueUseCase,
    GetIssueAuditLogsUseCase,
    GetNearbyIssuesGeoJSONUseCase,
    ListIssuesUseCase,
    RateIssueUseCase,
    RejectIssueUseCase,
    ReopenIssueUseCase,
    UpdateIssueStatusUseCase,
    UploadAttachmentUseCase,
    UpvoteIssueUseCase
)
from src.domain.issues.issue_entity import IssueStatus
from src.domain.users.user_entity import UserRole
from src.infrastructure.storage.interface import StorageAdapterInterface
from src.presentation.api.dependencies import (
    RoleChecker,
    get_current_user_claims,
    get_storage_adapter,
    get_uow
)

router = APIRouter(prefix="/issues", tags=["Issues"])


@router.post("", response_model=IssueResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_issue(
    dto: CreateIssueDTO,
    claims: dict = Depends(get_current_user_claims),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Submits a new civic issue report."""
    reporter_id = uuid.UUID(claims["sub"])
    use_case = CreateIssueUseCase(uow=uow)
    return await use_case.execute(dto=dto, reporter_id=reporter_id)


@router.get("", response_model=PaginatedIssuesDTO, status_code=status.HTTP_200_OK)
async def list_issues(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    issue_status: Optional[IssueStatus] = Query(None, alias="status"),
    category_id: Optional[uuid.UUID] = Query(None),
    latitude: Optional[float] = Query(None, ge=-90.0, le=90.0),
    longitude: Optional[float] = Query(None, ge=-180.0, le=180.0),
    radius_km: Optional[float] = Query(None, gt=0),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Query and paginate public issue reports with optional filters."""
    use_case = ListIssuesUseCase(uow=uow)
    return await use_case.execute(
        page=page,
        per_page=per_page,
        status=issue_status,
        category_id=category_id,
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km
    )


@router.get("/nearby", response_model=GeoJSONFeatureCollectionDTO, status_code=status.HTTP_200_OK)
async def get_nearby_issues_geojson(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Center latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Center longitude"),
    radius_km: float = Query(5.0, gt=0, le=100.0, description="Radius search distance in km"),
    issue_status: Optional[IssueStatus] = Query(None, alias="status"),
    category_id: Optional[uuid.UUID] = Query(None),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of features returned"),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Search nearby civic issues within a radius and return an RFC 7946 GeoJSON FeatureCollection."""
    use_case = GetNearbyIssuesGeoJSONUseCase(uow=uow)
    return await use_case.execute(
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        status=issue_status,
        category_id=category_id,
        limit=limit
    )


@router.post("/{issue_id}/approve", response_model=IssueResponseDTO, status_code=status.HTTP_200_OK)
async def approve_issue_report(
    issue_id: uuid.UUID,
    dto: ApproveReportDTO = ApproveReportDTO(),
    claims: dict = Depends(RoleChecker([UserRole.OFFICIAL, UserRole.ADMIN])),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Approves a reported issue (transitions SUBMITTED -> ACKNOWLEDGED) and logs audit event."""
    actor_id = uuid.UUID(claims["sub"])
    use_case = ApproveIssueUseCase(uow=uow)
    return await use_case.execute(issue_id=issue_id, dto=dto, actor_id=actor_id)


@router.post("/{issue_id}/reject", response_model=IssueResponseDTO, status_code=status.HTTP_200_OK)
async def reject_issue_report(
    issue_id: uuid.UUID,
    dto: RejectReportDTO,
    claims: dict = Depends(RoleChecker([UserRole.OFFICIAL, UserRole.ADMIN])),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Rejects a reported issue with mandatory rejection reason and logs audit event."""
    actor_id = uuid.UUID(claims["sub"])
    use_case = RejectIssueUseCase(uow=uow)
    return await use_case.execute(issue_id=issue_id, dto=dto, actor_id=actor_id)


@router.post("/{issue_id}/assign", response_model=IssueResponseDTO, status_code=status.HTTP_200_OK)
async def assign_worker_department(
    issue_id: uuid.UUID,
    dto: AssignDepartmentDTO,
    claims: dict = Depends(RoleChecker([UserRole.ADMIN])),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Reassigns an issue to a target municipal department/worker (Admin only)."""
    actor_id = uuid.UUID(claims["sub"])
    use_case = AssignDepartmentUseCase(uow=uow)
    return await use_case.execute(issue_id=issue_id, dto=dto, actor_id=actor_id)


@router.patch("/{issue_id}/status", response_model=IssueResponseDTO, status_code=status.HTTP_200_OK)
async def update_issue_status(
    issue_id: uuid.UUID,
    dto: UpdateIssueStatusDTO,
    claims: dict = Depends(RoleChecker([UserRole.OFFICIAL, UserRole.ADMIN])),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Updates issue state machine status and priority (Official/Admin only)."""
    actor_id = uuid.UUID(claims["sub"])
    use_case = UpdateIssueStatusUseCase(uow=uow)
    return await use_case.execute(issue_id=issue_id, dto=dto, actor_id=actor_id)


@router.get("/{issue_id}/audit-logs", response_model=List[AuditLogResponseDTO], status_code=status.HTTP_200_OK)
async def get_issue_audit_logs(
    issue_id: uuid.UUID,
    claims: dict = Depends(get_current_user_claims),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Retrieves immutable audit trail history for an issue."""
    use_case = GetIssueAuditLogsUseCase(uow=uow)
    return await use_case.execute(issue_id=issue_id)


@router.post("/{issue_id}/upvote", response_model=IssueResponseDTO, status_code=status.HTTP_200_OK)
async def upvote_issue(
    issue_id: uuid.UUID,
    claims: dict = Depends(get_current_user_claims),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Upvotes an existing issue report."""
    user_id = uuid.UUID(claims["sub"])
    use_case = UpvoteIssueUseCase(uow=uow)
    return await use_case.execute(issue_id=issue_id, user_id=user_id)


@router.post("/{issue_id}/attachments", response_model=AttachmentResponseDTO, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    issue_id: uuid.UUID,
    file: UploadFile = File(...),
    claims: dict = Depends(get_current_user_claims),
    uow: AbstractUnitOfWork = Depends(get_uow),
    storage: StorageAdapterInterface = Depends(get_storage_adapter)
):
    """Uploads a photo attachment linked to an issue."""
    user_id = uuid.UUID(claims["sub"])
    file_bytes = await file.read()
    file_name = file.filename or "attachment.jpg"
    mime_type = file.content_type or "image/jpeg"

    use_case = UploadAttachmentUseCase(uow=uow, storage=storage)
    return await use_case.execute(
        issue_id=issue_id,
        user_id=user_id,
        file_bytes=file_bytes,
        file_name=file_name,
        mime_type=mime_type
    )


@router.post("/{issue_id}/rate", response_model=IssueResponseDTO, status_code=status.HTTP_200_OK)
async def rate_issue_resolution(
    issue_id: uuid.UUID,
    dto: RateIssueDTO,
    claims: dict = Depends(get_current_user_claims),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Allows original reporter to rate a resolved issue (1-5 stars + feedback)."""
    user_id = uuid.UUID(claims["sub"])
    use_case = RateIssueUseCase(uow=uow)
    return await use_case.execute(issue_id=issue_id, rating=dto.rating, feedback_notes=dto.feedback_notes, user_id=user_id)


@router.post("/{issue_id}/reopen", response_model=IssueResponseDTO, status_code=status.HTTP_200_OK)
async def reopen_issue(
    issue_id: uuid.UUID,
    dto: ReopenIssueDTO,
    claims: dict = Depends(get_current_user_claims),
    uow: AbstractUnitOfWork = Depends(get_uow)
):
    """Allows original reporter to re-open a resolved issue if repair is incomplete."""
    user_id = uuid.UUID(claims["sub"])
    use_case = ReopenIssueUseCase(uow=uow)
    return await use_case.execute(issue_id=issue_id, reason=dto.reason, user_id=user_id)
