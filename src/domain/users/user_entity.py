from dataclasses import dataclass
from enum import Enum
from typing import Optional
import uuid
from src.domain.common.base_entity import BaseEntity
from src.domain.common.value_objects import EmailAddress


class UserRole(str, Enum):
    """
    Role-Based Access Control (RBAC) System Roles.
    """
    CITIZEN = "CITIZEN"
    OFFICIAL = "OFFICIAL"
    ADMIN = "ADMIN"


@dataclass
class User(BaseEntity):
    """
    User Domain Entity representing citizens, officials, and admins.
    Pure enterprise domain model with no ORM or API dependencies.
    """
    email: EmailAddress = None  # type: ignore
    password_hash: str = ""
    full_name: str = ""
    role: UserRole = UserRole.CITIZEN
    phone_number: Optional[str] = None
    is_active: bool = True

    def deactivate(self) -> None:
        """Deactivates user account."""
        self.is_active = False
        self.mark_updated()

    def activate(self) -> None:
        """Activates user account."""
        self.is_active = True
        self.mark_updated()

    def update_profile(self, full_name: Optional[str] = None, phone_number: Optional[str] = None) -> None:
        """Updates user profile metadata."""
        if full_name:
            self.full_name = full_name
        if phone_number is not None:
            self.phone_number = phone_number
        self.mark_updated()
