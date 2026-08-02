from abc import ABC, abstractmethod
import bcrypt


class PasswordHasherInterface(ABC):
    """Abstract Password Hasher Interface."""

    @abstractmethod
    def hash_password(self, password: str) -> str:
        pass

    @abstractmethod
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        pass


class BcryptPasswordHasher(PasswordHasherInterface):
    """
    Direct Bcrypt password hasher implementation.
    Safe, modern, and immune to legacy library wrapping issues.
    """

    def hash_password(self, password: str) -> str:
        pwd_bytes = password.encode("utf-8")
        # Enforce 72-byte max limit for Bcrypt safety
        if len(pwd_bytes) > 72:
            pwd_bytes = pwd_bytes[:72]
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode("utf-8")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        pwd_bytes = plain_password.encode("utf-8")
        if len(pwd_bytes) > 72:
            pwd_bytes = pwd_bytes[:72]
        hashed_bytes = hashed_password.encode("utf-8")
        try:
            return bcrypt.checkpw(pwd_bytes, hashed_bytes)
        except Exception:
            return False
