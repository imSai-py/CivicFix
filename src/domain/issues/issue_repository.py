from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
import uuid
from src.domain.issues.issue_entity import Attachment, Category, Department, Issue, IssueAuditLog, IssueStatus


class IssueRepositoryInterface(ABC):
    """
    Abstract IssueRepository Contract (Port).
    Defines database operations for issues, categories, attachments, and audit logs.
    """

    @abstractmethod
    async def get_by_id(self, issue_id: uuid.UUID) -> Optional[Issue]:
        """Fetch issue by unique UUID with preloaded attachments."""
        pass

    @abstractmethod
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
        """Query and paginate issues with optional filters."""
        pass

    @abstractmethod
    async def save(self, issue: Issue) -> Issue:
        """Persist new or updated Issue entity."""
        pass

    @abstractmethod
    async def save_attachment(self, attachment: Attachment) -> Attachment:
        """Persist attachment record."""
        pass

    @abstractmethod
    async def get_category_by_id(self, category_id: uuid.UUID) -> Optional[Category]:
        """Fetch category by UUID."""
        pass

    @abstractmethod
    async def list_categories(self) -> List[Category]:
        """Fetch all active categories."""
        pass

    @abstractmethod
    async def save_category(self, category: Category) -> Category:
        """Save category entity."""
        pass

    @abstractmethod
    async def get_department_by_id(self, department_id: uuid.UUID) -> Optional[Department]:
        """Fetch department by UUID."""
        pass

    @abstractmethod
    async def save_department(self, department: Department) -> Department:
        """Save department entity."""
        pass

    @abstractmethod
    async def has_user_upvoted(self, issue_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Check if user has already upvoted an issue."""
        pass

    @abstractmethod
    async def record_upvote(self, issue_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Record user upvote."""
        pass

    @abstractmethod
    async def save_audit_log(self, audit_log: IssueAuditLog) -> IssueAuditLog:
        """Persist immutable audit log entry."""
        pass

    @abstractmethod
    async def list_audit_logs(self, issue_id: uuid.UUID) -> List[IssueAuditLog]:
        """Fetch chronological audit history for an issue."""
        pass
