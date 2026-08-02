import math
from typing import List, Optional
import uuid
from src.application.common.uow import AbstractUnitOfWork
from src.application.issues.dtos import (
    ApproveReportDTO,
    AssignDepartmentDTO,
    AttachmentResponseDTO,
    AuditLogResponseDTO,
    CategoryResponseDTO,
    CoordinatesDTO,
    CreateIssueDTO,
    GeoJSONFeatureCollectionDTO,
    GeoJSONFeatureDTO,
    GeoJSONGeometryDTO,
    IssueResponseDTO,
    PaginatedIssuesDTO,
    RejectReportDTO,
    UpdateIssueStatusDTO
)
from src.domain.common.exceptions import (
    EntityAlreadyExistsError,
    EntityNotFoundError,
    UnauthorizedAccessError
)
from src.domain.issues.issue_entity import (
    Attachment,
    AuditAction,
    Coordinates,
    Issue,
    IssueAuditLog,
    IssuePriority,
    IssueStatus
)
from src.infrastructure.storage.interface import StorageAdapterInterface


class CreateIssueUseCase:
    """Use case for submitting a new civic issue report."""
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(self, dto: CreateIssueDTO, reporter_id: uuid.UUID) -> IssueResponseDTO:
        async with self.uow:
            category = await self.uow.issues.get_category_by_id(dto.category_id)
            if not category or not category.is_active:
                raise EntityNotFoundError("Category", str(dto.category_id))

            coords = Coordinates(
                latitude=dto.location.latitude,
                longitude=dto.location.longitude,
                address=dto.location.address
            )

            issue = Issue(
                title=dto.title,
                description=dto.description,
                category_id=category.id,
                assigned_department_id=category.default_department_id,
                reporter_id=reporter_id,
                location=coords,
                status=IssueStatus.SUBMITTED,
                priority=dto.priority or IssuePriority.MEDIUM
            )

            saved_issue = await self.uow.issues.save(issue)

            # Record initial audit log
            audit = IssueAuditLog(
                issue_id=saved_issue.id,
                actor_id=reporter_id,
                action=AuditAction.REPORT_SUBMITTED,
                previous_state=None,
                new_state=saved_issue.status.value,
                remarks="Initial report submission"
            )
            await self.uow.issues.save_audit_log(audit)

            await self.uow.commit()
            return self._map_to_dto(saved_issue)

    @staticmethod
    def _map_to_dto(issue: Issue) -> IssueResponseDTO:
        return IssueResponseDTO(
            id=issue.id,
            title=issue.title,
            description=issue.description,
            status=issue.status,
            priority=issue.priority,
            category_id=issue.category_id,
            assigned_department_id=issue.assigned_department_id,
            reporter_id=issue.reporter_id,
            location=CoordinatesDTO(
                latitude=issue.location.latitude,
                longitude=issue.location.longitude,
                address=issue.location.address
            ),
            upvote_count=issue.upvote_count,
            created_at=issue.created_at,
            updated_at=issue.updated_at,
            resolved_at=issue.resolved_at,
            attachments=[
                AttachmentResponseDTO(
                    id=att.id,
                    issue_id=att.issue_id,
                    file_path=att.file_path,
                    file_name=att.file_name,
                    mime_type=att.mime_type,
                    file_size_bytes=att.file_size_bytes,
                    created_at=att.created_at
                ) for att in issue.attachments
            ]
        )


class ListIssuesUseCase:
    """Use case for querying and paginating public civic issues."""
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(
        self,
        page: int = 1,
        per_page: int = 20,
        status: Optional[IssueStatus] = None,
        category_id: Optional[uuid.UUID] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None
    ) -> PaginatedIssuesDTO:
        async with self.uow:
            issues, total = await self.uow.issues.list_issues(
                page=page,
                per_page=per_page,
                status=status,
                category_id=category_id,
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km
            )

            dtos = [CreateIssueUseCase._map_to_dto(item) for item in issues]
            total_pages = math.ceil(total / per_page) if per_page > 0 else 1

            return PaginatedIssuesDTO(
                items=dtos,
                total_items=total,
                page=page,
                per_page=per_page,
                total_pages=total_pages
            )


class GetNearbyIssuesGeoJSONUseCase:
    """Use case for querying nearby civic issues and returning GeoJSON."""
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 5.0,
        status: Optional[IssueStatus] = None,
        category_id: Optional[uuid.UUID] = None,
        limit: int = 50
    ) -> GeoJSONFeatureCollectionDTO:
        async with self.uow:
            issues, total = await self.uow.issues.list_issues(
                page=1,
                per_page=limit,
                status=status,
                category_id=category_id,
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km
            )

            features = []
            for issue in issues:
                feature = GeoJSONFeatureDTO(
                    type="Feature",
                    geometry=GeoJSONGeometryDTO(
                        type="Point",
                        coordinates=[issue.location.longitude, issue.location.latitude]
                    ),
                    properties={
                        "id": str(issue.id),
                        "title": issue.title,
                        "description": issue.description,
                        "status": issue.status.value,
                        "priority": issue.priority.value,
                        "category_id": str(issue.category_id),
                        "assigned_department_id": str(issue.assigned_department_id),
                        "reporter_id": str(issue.reporter_id),
                        "address": issue.location.address,
                        "upvote_count": issue.upvote_count,
                        "created_at": issue.created_at.isoformat(),
                        "resolved_at": issue.resolved_at.isoformat() if issue.resolved_at else None
                    }
                )
                features.append(feature)

            return GeoJSONFeatureCollectionDTO(
                type="FeatureCollection",
                features=features,
                meta={
                    "query": {
                        "center_latitude": latitude,
                        "center_longitude": longitude,
                        "radius_km": radius_km
                    },
                    "count": len(features),
                    "total_matching": total
                }
            )


class UpdateIssueStatusUseCase:
    """Use case for official state machine status transitions."""
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(
        self,
        issue_id: uuid.UUID,
        dto: UpdateIssueStatusDTO,
        actor_id: uuid.UUID
    ) -> IssueResponseDTO:
        async with self.uow:
            issue = await self.uow.issues.get_by_id(issue_id)
            if not issue:
                raise EntityNotFoundError("Issue", str(issue_id))

            prev_status = issue.status.value
            issue.transition_status(dto.status, dto.priority)
            saved = await self.uow.issues.save(issue)

            audit = IssueAuditLog(
                issue_id=saved.id,
                actor_id=actor_id,
                action=AuditAction.STATUS_CHANGED,
                previous_state=prev_status,
                new_state=saved.status.value,
                remarks=dto.remarks
            )
            await self.uow.issues.save_audit_log(audit)

            await self.uow.commit()
            return CreateIssueUseCase._map_to_dto(saved)


class ApproveIssueUseCase:
    """Use case for official report approval (ACKNOWLEDGED)."""
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(self, issue_id: uuid.UUID, dto: ApproveReportDTO, actor_id: uuid.UUID) -> IssueResponseDTO:
        async with self.uow:
            issue = await self.uow.issues.get_by_id(issue_id)
            if not issue:
                raise EntityNotFoundError("Issue", str(issue_id))

            prev_status = issue.status.value
            issue.transition_status(IssueStatus.ACKNOWLEDGED)
            saved = await self.uow.issues.save(issue)

            audit = IssueAuditLog(
                issue_id=saved.id,
                actor_id=actor_id,
                action=AuditAction.REPORT_APPROVED,
                previous_state=prev_status,
                new_state=saved.status.value,
                remarks=dto.remarks or "Report approved by official"
            )
            await self.uow.issues.save_audit_log(audit)

            await self.uow.commit()
            return CreateIssueUseCase._map_to_dto(saved)


class RejectIssueUseCase:
    """Use case for official report rejection (REJECTED)."""
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(self, issue_id: uuid.UUID, dto: RejectReportDTO, actor_id: uuid.UUID) -> IssueResponseDTO:
        async with self.uow:
            issue = await self.uow.issues.get_by_id(issue_id)
            if not issue:
                raise EntityNotFoundError("Issue", str(issue_id))

            prev_status = issue.status.value
            issue.transition_status(IssueStatus.REJECTED)
            saved = await self.uow.issues.save(issue)

            audit = IssueAuditLog(
                issue_id=saved.id,
                actor_id=actor_id,
                action=AuditAction.REPORT_REJECTED,
                previous_state=prev_status,
                new_state=saved.status.value,
                remarks=dto.remarks
            )
            await self.uow.issues.save_audit_log(audit)

            await self.uow.commit()
            return CreateIssueUseCase._map_to_dto(saved)


class AssignDepartmentUseCase:
    """Use case for reassigning issue to a target department/worker."""
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(self, issue_id: uuid.UUID, dto: AssignDepartmentDTO, actor_id: uuid.UUID) -> IssueResponseDTO:
        async with self.uow:
            issue = await self.uow.issues.get_by_id(issue_id)
            if not issue:
                raise EntityNotFoundError("Issue", str(issue_id))

            dept = await self.uow.issues.get_department_by_id(dto.department_id)
            if not dept or not dept.is_active:
                raise EntityNotFoundError("Department", str(dto.department_id))

            prev_dept_id = str(issue.assigned_department_id)
            issue.assign_department(dept.id)
            saved = await self.uow.issues.save(issue)

            audit = IssueAuditLog(
                issue_id=saved.id,
                actor_id=actor_id,
                action=AuditAction.DEPARTMENT_ASSIGNED,
                previous_state=prev_dept_id,
                new_state=str(dept.id),
                remarks=dto.remarks or f"Reassigned to department: {dept.name}"
            )
            await self.uow.issues.save_audit_log(audit)

            await self.uow.commit()
            return CreateIssueUseCase._map_to_dto(saved)


class GetIssueAuditLogsUseCase:
    """Use case for retrieving audit trail history."""
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(self, issue_id: uuid.UUID) -> List[AuditLogResponseDTO]:
        async with self.uow:
            issue = await self.uow.issues.get_by_id(issue_id)
            if not issue:
                raise EntityNotFoundError("Issue", str(issue_id))

            logs = await self.uow.issues.list_audit_logs(issue_id)
            return [
                AuditLogResponseDTO(
                    id=log.id,
                    issue_id=log.issue_id,
                    actor_id=log.actor_id,
                    action=log.action,
                    previous_state=log.previous_state,
                    new_state=log.new_state,
                    remarks=log.remarks,
                    created_at=log.created_at
                ) for log in logs
            ]


class UpvoteIssueUseCase:
    """Use case for citizen upvoting of issues."""
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(self, issue_id: uuid.UUID, user_id: uuid.UUID) -> IssueResponseDTO:
        async with self.uow:
            issue = await self.uow.issues.get_by_id(issue_id)
            if not issue:
                raise EntityNotFoundError("Issue", str(issue_id))

            has_upvoted = await self.uow.issues.has_user_upvoted(issue_id, user_id)
            if has_upvoted:
                raise EntityAlreadyExistsError("Upvote", "user_id", str(user_id))

            await self.uow.issues.record_upvote(issue_id, user_id)
            issue.increment_upvote()
            saved = await self.uow.issues.save(issue)
            await self.uow.commit()
            return CreateIssueUseCase._map_to_dto(saved)


class UploadAttachmentUseCase:
    """Use case for attaching media photos to an issue."""
    def __init__(
        self,
        uow: AbstractUnitOfWork,
        storage: StorageAdapterInterface
    ):
        self.uow = uow
        self.storage = storage

    async def execute(
        self,
        issue_id: uuid.UUID,
        user_id: uuid.UUID,
        file_bytes: bytes,
        file_name: str,
        mime_type: str
    ) -> AttachmentResponseDTO:
        async with self.uow:
            issue = await self.uow.issues.get_by_id(issue_id)
            if not issue:
                raise EntityNotFoundError("Issue", str(issue_id))

            rel_path, clean_filename, file_size = await self.storage.save_file(
                file_bytes=file_bytes,
                file_name=file_name,
                mime_type=mime_type
            )

            attachment = Attachment(
                issue_id=issue_id,
                file_path=rel_path,
                file_name=clean_filename,
                mime_type=mime_type,
                file_size_bytes=file_size,
                uploaded_by_id=user_id
            )

            saved_att = await self.uow.issues.save_attachment(attachment)
            await self.uow.commit()

            return AttachmentResponseDTO(
                id=saved_att.id,
                issue_id=saved_att.issue_id,
                file_path=saved_att.file_path,
                file_name=saved_att.file_name,
                mime_type=saved_att.mime_type,
                file_size_bytes=saved_att.file_size_bytes,
                created_at=saved_att.created_at
            )


class ListCategoriesUseCase:
    """Use case for retrieving all active issue categories."""
    def __init__(self, uow: AbstractUnitOfWork):
        self.uow = uow

    async def execute(self) -> List[CategoryResponseDTO]:
        async with self.uow:
            categories = await self.uow.issues.list_categories()
            return [
                CategoryResponseDTO(
                    id=cat.id,
                    name=cat.name,
                    description=cat.description,
                    default_department_id=cat.default_department_id,
                    default_sla_hours=cat.default_sla_hours
                ) for cat in categories
            ]
