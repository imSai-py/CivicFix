from datetime import datetime, timezone
from fastapi import Request, status
from fastapi.responses import JSONResponse
from src.domain.common.exceptions import (
    DomainException,
    EntityAlreadyExistsError,
    EntityNotFoundError,
    InvalidCredentialsError,
    InvalidTokenError,
    UnauthorizedAccessError
)


async def domain_exception_handler(request: Request, exc: DomainException) -> JSONResponse:
    """
    Global FastAPI Exception Handler mapping domain exceptions to RFC standard HTTP responses.
    """
    timestamp = datetime.now(timezone.utc).isoformat()

    if isinstance(exc, EntityNotFoundError):
        status_code = status.HTTP_404_NOT_FOUND
        error_code = "RESOURCE_NOT_FOUND"
    elif isinstance(exc, EntityAlreadyExistsError):
        status_code = status.HTTP_409_CONFLICT
        error_code = "RESOURCE_ALREADY_EXISTS"
    elif isinstance(exc, InvalidCredentialsError):
        status_code = status.HTTP_401_UNAUTHORIZED
        error_code = "INVALID_CREDENTIALS"
    elif isinstance(exc, InvalidTokenError):
        status_code = status.HTTP_401_UNAUTHORIZED
        error_code = "INVALID_TOKEN"
    elif isinstance(exc, UnauthorizedAccessError):
        status_code = status.HTTP_403_FORBIDDEN
        error_code = "ACCESS_DENIED"
    else:
        status_code = status.HTTP_400_BAD_REQUEST
        error_code = "BUSINESS_RULE_VIOLATION"

    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": error_code,
                "message": exc.message,
                "timestamp": timestamp,
                "path": str(request.url.path)
            }
        }
    )
