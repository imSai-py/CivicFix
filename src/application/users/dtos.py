from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from src.domain.users.user_entity import UserRole


class RegisterUserDTO(BaseModel):
    """Input payload for user registration."""
    email: EmailStr = Field(..., description="Valid user email address")
    password: str = Field(..., min_length=8, max_length=100, description="Plaintext password")
    full_name: str = Field(..., min_length=2, max_length=150, description="User full name")
    phone_number: Optional[str] = Field(None, max_length=30, description="Optional contact phone")


class LoginDTO(BaseModel):
    """Input payload for authentication login."""
    email: EmailStr = Field(..., description="User login email")
    password: str = Field(..., description="User password")


class RefreshTokenDTO(BaseModel):
    """Input payload for refreshing access token."""
    refresh_token: str = Field(..., description="Valid JWT Refresh Token")


class TokenResponseDTO(BaseModel):
    """Output payload containing JWT Bearer tokens."""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in_seconds: int


class UserResponseDTO(BaseModel):
    """Output DTO representing public User profile data."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    phone_number: Optional[str] = None
    is_active: bool
    created_at: datetime
