from functools import lru_cache
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Core Settings powered by Pydantic v2 BaseSettings.
    Automatically reads environment variables and provides type-safe configuration.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Application Environment
    ENVIRONMENT: Literal["development", "staging", "production", "testing"] = "development"
    PROJECT_NAME: str = "CivicFix Platform"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # Database Selection (Use SQLite for zero-setup local dev, PostgreSQL for prod)
    USE_SQLITE_DEV: bool = True

    # PostgreSQL Database Settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "civicfix_db"
    POSTGRES_USER: str = "civicfix_user"
    POSTGRES_PASSWORD: str = "civicfix_secure_password_123"
    DB_ECHO: bool = False

    # Redis Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # Security & JWT Token Settings
    JWT_SECRET_KEY: str = Field(
        default="super_secret_jwt_key_change_this_in_production_12345",
        description="Secret key used for signing JWT tokens"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Storage Settings
    STORAGE_BACKEND: Literal["local", "s3"] = "local"
    MEDIA_UPLOAD_DIR: str = "/app/uploads"

    @property
    def async_database_url(self) -> str:
        """
        Constructs the database connection URI.
        Uses SQLite (sqlite+aiosqlite) for local development when USE_SQLITE_DEV is True.
        Uses PostgreSQL (postgresql+asyncpg) for production.
        """
        if self.ENVIRONMENT == "testing":
            return "sqlite+aiosqlite:///:memory:"
        if self.USE_SQLITE_DEV and self.ENVIRONMENT == "development":
            return "sqlite+aiosqlite:///./civicfix_dev.db"
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


@lru_cache
def get_settings() -> Settings:
    """
    Returns cached Settings instance.
    """
    return Settings()
