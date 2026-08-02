from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from typing import Any, Dict
import jwt
from src.core.config import get_settings
from src.domain.common.exceptions import InvalidTokenError

settings = get_settings()


class JWTHandlerInterface(ABC):
    """Abstract JWT Handler Interface."""

    @abstractmethod
    def create_access_token(self, subject: str, claims: Dict[str, Any] = None) -> str:
        pass

    @abstractmethod
    def create_refresh_token(self, subject: str) -> str:
        pass

    @abstractmethod
    def decode_token(self, token: str) -> Dict[str, Any]:
        pass


class PyJWTHandler(JWTHandlerInterface):
    """PyJWT concrete implementation."""

    def __init__(self):
        self.secret_key = settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
        self.access_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_expire_days = settings.REFRESH_TOKEN_EXPIRE_DAYS

    def create_access_token(self, subject: str, claims: Dict[str, Any] = None) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(subject),
            "type": "access",
            "iat": now,
            "exp": now + timedelta(minutes=self.access_expire_minutes)
        }
        if claims:
            payload.update(claims)
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(self, subject: str) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(subject),
            "type": "refresh",
            "iat": now,
            "exp": now + timedelta(days=self.refresh_expire_days)
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def decode_token(self, token: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise InvalidTokenError("Token has expired.")
        except jwt.PyJWTError:
            raise InvalidTokenError("Could not validate credentials token.")
