class ApplicationCoreException(Exception):
    """Base exception for all application framework level errors."""
    def __init__(self, message: str = "An unexpected application error occurred."):
        self.message = message
        super().__init__(self.message)


class ConfigurationError(ApplicationCoreException):
    """Raised when environment or settings configuration is invalid."""
    pass
