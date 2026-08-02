class DomainException(Exception):
    """Base exception for all enterprise business domain errors."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class EntityNotFoundError(DomainException):
    """Raised when a requested domain entity is not found."""
    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(f"{entity_name} with ID '{entity_id}' was not found.")
        self.entity_name = entity_name
        self.entity_id = entity_id


class EntityAlreadyExistsError(DomainException):
    """Raised when an entity with unique identity constraints already exists."""
    def __init__(self, entity_name: str, field_name: str, value: str):
        super().__init__(f"{entity_name} with {field_name} '{value}' already exists.")
        self.entity_name = entity_name
        self.field_name = field_name
        self.value = value


class InvalidCredentialsError(DomainException):
    """Raised when authentication credentials (email/password) are incorrect."""
    def __init__(self, message: str = "Invalid email or password."):
        super().__init__(message)


class UnauthorizedAccessError(DomainException):
    """Raised when an operation violates role-based access rules."""
    def __init__(self, message: str = "Access denied. Insufficient permissions."):
        super().__init__(message)


class InvalidTokenError(DomainException):
    """Raised when a JWT token is expired, tampered with, or invalid."""
    def __init__(self, message: str = "Invalid or expired token."):
        super().__init__(message)
