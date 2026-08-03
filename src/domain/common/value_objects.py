from dataclasses import dataclass
from email_validator import validate_email, EmailNotValidError
from src.domain.common.exceptions import DomainException


@dataclass(frozen=True)
class EmailAddress:
    """
    Immutable Value Object representing a validated email address.
    Uses strict RFC validation to prevent gibberish and malformed emails.
    """
    value: str

    def __post_init__(self):
        if not self.value or not isinstance(self.value, str):
            raise DomainException("Email address cannot be empty.")
        clean_email = self.value.strip().lower()
        try:
            # Validate email syntax and domain TLD strictly
            valid = validate_email(clean_email, check_deliverability=False)
            object.__setattr__(self, "value", valid.normalized)
        except EmailNotValidError as exc:
            raise DomainException(f"Invalid email address format: '{self.value}'. {str(exc)}")
