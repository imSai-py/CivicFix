import pytest
from src.domain.common.exceptions import DomainException
from src.domain.common.value_objects import EmailAddress
from src.domain.users.user_entity import User, UserRole
from src.infrastructure.security.password_hasher import BcryptPasswordHasher


def test_email_value_object_valid():
    email_vo = EmailAddress("Test.User@example.com")
    assert email_vo.value == "test.user@example.com"


def test_email_value_object_invalid():
    with pytest.raises(DomainException):
        EmailAddress("invalid-email-format")


def test_password_hasher_bcrypt():
    hasher = BcryptPasswordHasher()
    pwd = "SecurePassword123!"
    hashed = hasher.hash_password(pwd)
    assert hashed != pwd
    assert hasher.verify_password(pwd, hashed) is True
    assert hasher.verify_password("WrongPassword", hashed) is False


def test_user_entity_defaults():
    email = EmailAddress("citizen@civicfix.org")
    user = User(
        email=email,
        password_hash="hashed_secret",
        full_name="Jane Citizen",
        role=UserRole.CITIZEN
    )

    assert user.role == UserRole.CITIZEN
    assert user.is_active is True
    assert user.full_name == "Jane Citizen"
    assert user.id is not None
