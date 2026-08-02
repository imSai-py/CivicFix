from dataclasses import dataclass, field
from datetime import datetime, timezone
import uuid


def utc_now() -> datetime:
    """Returns current UTC timestamp with timezone metadata."""
    return datetime.now(timezone.utc)


@dataclass
class BaseEntity:
    """
    Abstract Base Domain Entity.
    Provides standard identity (UUID v4) and timestamp attributes.
    Pure Python dataclass with no framework dependencies.
    """
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)

    def mark_updated(self) -> None:
        """Updates entity timestamp upon mutation."""
        self.updated_at = utc_now()
