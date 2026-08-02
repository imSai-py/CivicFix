from dataclasses import dataclass
import re
from src.domain.common.exceptions import DomainException


@dataclass(frozen=True)
class EmailAddress:
    """
    Immutable Value Object representing a validated email address.
    """
    value: str

    EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

    def __post_init__(self):
        if not self.value or not isinstance(self.value, str):
            raise DomainException("Email address cannot be empty.")
        clean_email = self.value.strip().lower()
        if not self.EMAIL_REGEX.match(clean_email):
            raise DomainException(f"Invalid email address format: '{self.value}'")
        object.__setattr__(self, "value", clean_email)
