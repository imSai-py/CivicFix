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
    avatar_url: Optional[str] = None
    is_active: bool = True
    xp_points: int = 0
    reputation_rank: str = "Civic Watcher"

    def deactivate(self) -> None:
        """Deactivates user account."""
        self.is_active = False
        self.mark_updated()

    def activate(self) -> None:
        """Activates user account."""
        self.is_active = True
        self.mark_updated()

    def update_profile(self, full_name: Optional[str] = None, phone_number: Optional[str] = None, avatar_url: Optional[str] = None) -> None:
        """Updates user profile metadata."""
        if full_name:
            self.full_name = full_name
        if phone_number is not None:
            self.phone_number = phone_number
        if avatar_url is not None:
            self.avatar_url = avatar_url
        self.mark_updated()

    def add_xp(self, points: int) -> int:
        """Awards XP points and updates civic rank."""
        self.xp_points += points
        if self.xp_points >= 500:
            self.reputation_rank = "Infrastructure Hero"
        elif self.xp_points >= 200:
            self.reputation_rank = "Community Guardian"
        elif self.xp_points >= 50:
            self.reputation_rank = "Active Citizen"
        else:
            self.reputation_rank = "Civic Watcher"
        self.mark_updated()
        return self.xp_points
