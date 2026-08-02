from datetime import datetime
from typing import List, Optional
import uuid
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Double,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.domain.issues.issue_entity import (
    Attachment,
    AuditAction,
    Category,
    Coordinates,
    Department,
    Issue,
    IssueAuditLog,
    IssuePriority,
    IssueStatus
)
from src.infrastructure.persistence.base_model import BaseModel

upvotes_table = Table(
    "issue_upvotes",
    BaseModel.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("issue_id", UUID(as_uuid=True), ForeignKey("issues.id", ondelete="CASCADE"), nullable=False, index=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
    Column("created_at", DateTime(timezone=True), nullable=False),
    UniqueConstraint("issue_id", "user_id", name="uq_issue_user_upvote")
)


class DepartmentModel(BaseModel):
    """Department ORM model."""
    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def to_domain(self) -> Department:
        return Department(
            id=self.id,
            name=self.name,
            code=self.code,
            description=self.description,
            is_active=self.is_active,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @classmethod
    def from_domain(cls, domain: Department) -> "DepartmentModel":
        return cls(
            id=domain.id,
            name=domain.name,
            code=domain.code,
            description=domain.description,
            is_active=domain.is_active,
            created_at=domain.created_at,
            updated_at=domain.updated_at
        )


class CategoryModel(BaseModel):
    """Category ORM model."""
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    default_department_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("departments.id", ondelete="RESTRICT"),
        nullable=False
    )
    default_sla_hours: Mapped[int] = mapped_column(Integer, default=48, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def to_domain(self) -> Category:
        return Category(
            id=self.id,
            name=self.name,
            description=self.description,
            default_department_id=self.default_department_id,
            default_sla_hours=self.default_sla_hours,
            is_active=self.is_active,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @classmethod
    def from_domain(cls, domain: Category) -> "CategoryModel":
        return cls(
            id=domain.id,
            name=domain.name,
            description=domain.description,
            default_department_id=domain.default_department_id,
            default_sla_hours=domain.default_sla_hours,
            is_active=domain.is_active,
            created_at=domain.created_at,
            updated_at=domain.updated_at
        )


class AttachmentModel(BaseModel):
    """Attachment ORM model."""
    __tablename__ = "issue_attachments"

    issue_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("issues.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    uploaded_by_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    def to_domain(self) -> Attachment:
        return Attachment(
            id=self.id,
            issue_id=self.issue_id,
            file_path=self.file_path,
            file_name=self.file_name,
            mime_type=self.mime_type,
            file_size_bytes=self.file_size_bytes,
            uploaded_by_id=self.uploaded_by_id,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @classmethod
    def from_domain(cls, domain: Attachment) -> "AttachmentModel":
        return cls(
            id=domain.id,
            issue_id=domain.issue_id,
            file_path=domain.file_path,
            file_name=domain.file_name,
            mime_type=domain.mime_type,
            file_size_bytes=domain.file_size_bytes,
            uploaded_by_id=domain.uploaded_by_id,
            created_at=domain.created_at,
            updated_at=domain.updated_at
        )


class AuditLogModel(BaseModel):
    """Immutable Audit Log ORM model."""
    __tablename__ = "issue_audit_logs"

    issue_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("issues.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    actor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False
    )
    action: Mapped[AuditAction] = mapped_column(
        SQLEnum(AuditAction, name="audit_action_enum", native_enum=False),
        nullable=False
    )
    previous_state: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    new_state: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def to_domain(self) -> IssueAuditLog:
        return IssueAuditLog(
            id=self.id,
            issue_id=self.issue_id,
            actor_id=self.actor_id,
            action=self.action,
            previous_state=self.previous_state,
            new_state=self.new_state,
            remarks=self.remarks,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @classmethod
    def from_domain(cls, domain: IssueAuditLog) -> "AuditLogModel":
        return cls(
            id=domain.id,
            issue_id=domain.issue_id,
            actor_id=domain.actor_id,
            action=domain.action,
            previous_state=domain.previous_state,
            new_state=domain.new_state,
            remarks=domain.remarks,
            created_at=domain.created_at,
            updated_at=domain.updated_at
        )


class IssueModel(BaseModel):
    """Issue ORM database table model."""
    __tablename__ = "issues"

    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[IssueStatus] = mapped_column(
        SQLEnum(IssueStatus, name="issue_status_enum", native_enum=False),
        default=IssueStatus.SUBMITTED,
        nullable=False,
        index=True
    )
    priority: Mapped[IssuePriority] = mapped_column(
        SQLEnum(IssuePriority, name="issue_priority_enum", native_enum=False),
        default=IssuePriority.MEDIUM,
        nullable=False,
        index=True
    )
    reporter_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    assigned_department_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("departments.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    latitude: Mapped[float] = mapped_column(Double, nullable=False)
    longitude: Mapped[float] = mapped_column(Double, nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    upvote_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    attachments: Mapped[List[AttachmentModel]] = relationship(
        "AttachmentModel",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def to_domain(self) -> Issue:
        coords = Coordinates(
            latitude=self.latitude,
            longitude=self.longitude,
            address=self.address
        )
        att_list = []
        if "attachments" in self.__dict__ and self.attachments:
            att_list = [att.to_domain() for att in self.attachments]

        return Issue(
            id=self.id,
            title=self.title,
            description=self.description,
            category_id=self.category_id,
            assigned_department_id=self.assigned_department_id,
            reporter_id=self.reporter_id,
            location=coords,
            status=self.status,
            priority=self.priority,
            upvote_count=self.upvote_count,
            created_at=self.created_at,
            updated_at=self.updated_at,
            resolved_at=self.resolved_at,
            attachments=att_list
        )

    @classmethod
    def from_domain(cls, domain: Issue) -> "IssueModel":
        return cls(
            id=domain.id,
            title=domain.title,
            description=domain.description,
            status=domain.status,
            priority=domain.priority,
            reporter_id=domain.reporter_id,
            assigned_department_id=domain.assigned_department_id,
            category_id=domain.category_id,
            latitude=domain.location.latitude,
            longitude=domain.location.longitude,
            address=domain.location.address,
            upvote_count=domain.upvote_count,
            created_at=domain.created_at,
            updated_at=domain.updated_at,
            resolved_at=domain.resolved_at
        )
