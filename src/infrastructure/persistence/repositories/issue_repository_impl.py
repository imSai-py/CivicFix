from datetime import datetime, timezone
import math
from typing import List, Optional, Tuple
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.issues.issue_entity import Attachment, Category, Department, Issue, IssueAuditLog, IssueStatus
from src.domain.issues.issue_repository import IssueRepositoryInterface
from src.infrastructure.persistence.models.issue_model import (
    AttachmentModel,
    AuditLogModel,
    CategoryModel,
    DepartmentModel,
    IssueModel,
    upvotes_table
)


class IssueRepositoryImpl(IssueRepositoryInterface):
    """
    SQLAlchemy 2.0 Async repository implementation for Issue domain entity.
    Supports both SQLite (development) and PostgreSQL (production).
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, issue_id: uuid.UUID) -> Optional[Issue]:
        stmt = select(IssueModel).where(IssueModel.id == issue_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return model.to_domain() if model else None

    async def list_issues(
        self,
        page: int = 1,
        per_page: int = 20,
        status: Optional[IssueStatus] = None,
        category_id: Optional[uuid.UUID] = None,
        assigned_department_id: Optional[uuid.UUID] = None,
        reporter_id: Optional[uuid.UUID] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None
    ) -> Tuple[List[Issue], int]:
        stmt = select(IssueModel)

        if status:
            stmt = stmt.where(IssueModel.status == status)
        if category_id:
            stmt = stmt.where(IssueModel.category_id == category_id)
        if assigned_department_id:
            stmt = stmt.where(IssueModel.assigned_department_id == assigned_department_id)
        if reporter_id:
            stmt = stmt.where(IssueModel.reporter_id == reporter_id)

        # Proximity bounding box filter calculation (Database-agnostic using Python math)
        if latitude is not None and longitude is not None and radius_km:
            lat_delta = radius_km / 111.0
            lng_delta = radius_km / (111.0 * math.cos(math.radians(latitude)))
            stmt = stmt.where(
                IssueModel.latitude.between(latitude - lat_delta, latitude + lat_delta),
                IssueModel.longitude.between(longitude - lng_delta, longitude + lng_delta)
            )

        # Count total items
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()

        # Pagination & Ordering
        offset = (page - 1) * per_page
        stmt = stmt.order_by(IssueModel.created_at.desc()).offset(offset).limit(per_page)

        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [model.to_domain() for model in models], total

    async def save(self, issue: Issue) -> Issue:
        stmt = select(IssueModel).where(IssueModel.id == issue.id)
        result = await self.session.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            existing.title = issue.title
            existing.description = issue.description
            existing.status = issue.status
            existing.priority = issue.priority
            existing.assigned_department_id = issue.assigned_department_id
            existing.upvote_count = issue.upvote_count
            existing.resolved_at = issue.resolved_at
            existing.resolution_photo_url = issue.resolution_photo_url
            existing.resolution_notes = issue.resolution_notes
            existing.citizen_rating = issue.citizen_rating
            existing.citizen_feedback = issue.citizen_feedback
            existing.reopen_count = issue.reopen_count
            existing.updated_at = issue.updated_at
            target = existing
        else:
            target = IssueModel.from_domain(issue)
            self.session.add(target)

        await self.session.flush()
        return target.to_domain()

    async def save_attachment(self, attachment: Attachment) -> Attachment:
        model = AttachmentModel.from_domain(attachment)
        self.session.add(model)
        await self.session.flush()
        return model.to_domain()

    async def get_category_by_id(self, category_id: uuid.UUID) -> Optional[Category]:
        stmt = select(CategoryModel).where(CategoryModel.id == category_id)
        res = await self.session.execute(stmt)
        model = res.scalar_one_or_none()
        return model.to_domain() if model else None

    async def list_categories(self) -> List[Category]:
        stmt = select(CategoryModel).where(CategoryModel.is_active == True)
        res = await self.session.execute(stmt)
        models = res.scalars().all()
        return [model.to_domain() for model in models]

    async def save_category(self, category: Category) -> Category:
        model = CategoryModel.from_domain(category)
        self.session.add(model)
        await self.session.flush()
        return model.to_domain()

    async def get_department_by_id(self, department_id: uuid.UUID) -> Optional[Department]:
        stmt = select(DepartmentModel).where(DepartmentModel.id == department_id)
        res = await self.session.execute(stmt)
        model = res.scalar_one_or_none()
        return model.to_domain() if model else None

    async def save_department(self, department: Department) -> Department:
        model = DepartmentModel.from_domain(department)
        self.session.add(model)
        await self.session.flush()
        return model.to_domain()

    async def has_user_upvoted(self, issue_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        stmt = select(upvotes_table).where(
            upvotes_table.c.issue_id == issue_id,
            upvotes_table.c.user_id == user_id
        )
        res = await self.session.execute(stmt)
        return res.first() is not None

    async def record_upvote(self, issue_id: uuid.UUID, user_id: uuid.UUID) -> None:
        stmt = upvotes_table.insert().values(
            id=uuid.uuid4(),
            issue_id=issue_id,
            user_id=user_id,
            created_at=datetime.now(timezone.utc)
        )
        await self.session.execute(stmt)

    async def save_audit_log(self, audit_log: IssueAuditLog) -> IssueAuditLog:
        model = AuditLogModel.from_domain(audit_log)
        self.session.add(model)
        await self.session.flush()
        return model.to_domain()

    async def list_audit_logs(self, issue_id: uuid.UUID) -> List[IssueAuditLog]:
        stmt = select(AuditLogModel).where(AuditLogModel.issue_id == issue_id).order_by(AuditLogModel.created_at.asc())
        res = await self.session.execute(stmt)
        models = res.scalars().all()
        return [model.to_domain() for model in models]
