from typing import Optional
from sqlalchemy import Boolean, Enum as SQLEnum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from src.domain.users.user_entity import User, UserRole
from src.domain.common.value_objects import EmailAddress
from src.infrastructure.persistence.base_model import BaseModel


class UserModel(BaseModel):
    """
    SQLAlchemy 2.0 ORM database mapping for the 'users' table.
    """
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role_enum", native_enum=False),
        default=UserRole.CITIZEN,
        nullable=False,
        index=True
    )
    phone_number: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    xp_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reputation_rank: Mapped[str] = mapped_column(String(100), default="Civic Watcher", nullable=False)

    def to_domain(self) -> User:
        """Converts ORM model to pure Domain entity."""
        return User(
            id=self.id,
            email=EmailAddress(self.email),
            password_hash=self.password_hash,
            full_name=self.full_name,
            role=self.role,
            phone_number=self.phone_number,
            is_active=self.is_active,
            xp_points=self.xp_points,
            reputation_rank=self.reputation_rank,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @classmethod
    def from_domain(cls, domain: User) -> "UserModel":
        """Creates ORM model from Domain entity."""
        return cls(
            id=domain.id,
            email=domain.email.value if domain.email else "",
            password_hash=domain.password_hash,
            full_name=domain.full_name,
            role=domain.role,
            phone_number=domain.phone_number,
            is_active=domain.is_active,
            xp_points=domain.xp_points,
            reputation_rank=domain.reputation_rank,
            created_at=domain.created_at,
            updated_at=domain.updated_at
        )
