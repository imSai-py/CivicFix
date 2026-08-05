from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
import uuid
from src.domain.common.base_entity import BaseEntity, utc_now
from src.domain.common.exceptions import DomainException


@dataclass(frozen=True)
class Coordinates:
    """
    Immutable Value Object representing geographic coordinates and physical address.
    Follows RFC 7946 GeoJSON position conventions [longitude, latitude].
    """
    latitude: float
    longitude: float
    address: Optional[str] = None

    def __post_init__(self):
        if not (-90.0 <= self.latitude <= 90.0):
            raise DomainException(f"Latitude must be between -90.0 and 90.0. Got: {self.latitude}")
        if not (-180.0 <= self.longitude <= 180.0):
            raise DomainException(f"Longitude must be between -180.0 and 180.0. Got: {self.longitude}")
        if self.address and len(self.address) > 255:
            raise DomainException("Address length cannot exceed 255 characters.")

    def to_geojson_geometry(self) -> dict:
        """
        Returns RFC 7946 GeoJSON Point geometry dictionary.
        Note: GeoJSON positions are formatted as [longitude, latitude].
        """
        return {
            "type": "Point",
            "coordinates": [self.longitude, self.latitude]
        }


class IssueStatus(str, Enum):
    """Civic Issue Lifecycle States."""
    SUBMITTED = "SUBMITTED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class IssuePriority(str, Enum):
    """Civic Issue Urgency Levels."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AuditAction(str, Enum):
    """Immutable Audit Log Event Actions."""
    REPORT_SUBMITTED = "REPORT_SUBMITTED"
    REPORT_APPROVED = "REPORT_APPROVED"
    REPORT_REJECTED = "REPORT_REJECTED"
    DEPARTMENT_ASSIGNED = "DEPARTMENT_ASSIGNED"
    STATUS_CHANGED = "STATUS_CHANGED"
    PRIORITY_CHANGED = "PRIORITY_CHANGED"


@dataclass
class Department(BaseEntity):
    """Municipal Department Entity."""
    name: str = ""
    code: str = ""
    description: Optional[str] = None
    is_active: bool = True


@dataclass
class Category(BaseEntity):
    """Civic Issue Category Entity."""
    name: str = ""
    description: Optional[str] = None
    default_department_id: uuid.UUID = field(default_factory=uuid.uuid4)
    default_sla_hours: int = 48
    is_active: bool = True


@dataclass
class Attachment(BaseEntity):
    """Issue Photo Attachment Entity."""
    issue_id: uuid.UUID = field(default_factory=uuid.uuid4)
    file_path: str = ""
    file_name: str = ""
    mime_type: str = ""
    file_size_bytes: int = 0
    uploaded_by_id: uuid.UUID = field(default_factory=uuid.uuid4)


@dataclass
class IssueAuditLog(BaseEntity):
    """Immutable Audit Log Domain Entity."""
    issue_id: uuid.UUID = field(default_factory=uuid.uuid4)
    actor_id: uuid.UUID = field(default_factory=uuid.uuid4)
    action: AuditAction = AuditAction.STATUS_CHANGED
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    remarks: Optional[str] = None


@dataclass
class Issue(BaseEntity):
    """
    Core Civic Issue Domain Entity.
    Manages issue lifecycle state machine transitions and upvoting logic.
    """
    title: str = ""
    description: str = ""
    category_id: uuid.UUID = field(default_factory=uuid.uuid4)
    assigned_department_id: uuid.UUID = field(default_factory=uuid.uuid4)
    reporter_id: uuid.UUID = field(default_factory=uuid.uuid4)
    location: Coordinates = field(default_factory=lambda: Coordinates(0.0, 0.0))
    status: IssueStatus = IssueStatus.SUBMITTED
    priority: IssuePriority = IssuePriority.MEDIUM
    upvote_count: int = 0
    resolved_at: Optional[datetime] = None
    resolution_photo_url: Optional[str] = None
    resolution_notes: Optional[str] = None
    citizen_rating: Optional[int] = None
    citizen_feedback: Optional[str] = None
    reopen_count: int = 0
    attachments: List[Attachment] = field(default_factory=list)

    def transition_status(
        self,
        new_status: IssueStatus,
        priority: Optional[IssuePriority] = None,
        allow_reopen: bool = False
    ) -> None:
        """State Machine Transition Rules."""
        if self.status in [IssueStatus.RESOLVED, IssueStatus.REJECTED] and not allow_reopen:
            raise DomainException(f"Cannot transition issue from terminal state '{self.status.value}'.")

        if new_status == IssueStatus.RESOLVED:
            self.resolved_at = utc_now()
        elif new_status != IssueStatus.RESOLVED and self.resolved_at:
            self.resolved_at = None

        if allow_reopen and new_status == IssueStatus.IN_PROGRESS:
            self.reopen_count += 1

        self.status = new_status
        if priority:
            self.priority = priority
        self.mark_updated()

    def assign_department(self, new_department_id: uuid.UUID) -> None:
        """Reassigns issue to a new municipal department."""
        self.assigned_department_id = new_department_id
        self.mark_updated()

    def increment_upvote(self) -> int:
        """Increments issue upvote count."""
        self.upvote_count += 1
        self.mark_updated()
        return self.upvote_count

    def add_attachment(self, attachment: Attachment) -> None:
        """Adds attachment metadata to issue."""
        if len(self.attachments) >= 5:
            raise DomainException("Maximum 5 media attachments allowed per issue report.")
        self.attachments.append(attachment)
        self.mark_updated()
