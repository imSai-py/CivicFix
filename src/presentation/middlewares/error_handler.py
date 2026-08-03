from datetime import datetime, timezone
import logging
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from src.domain.common.exceptions import (
    DomainException,
    EntityAlreadyExistsError,
    EntityNotFoundError,
    InvalidCredentialsError,
    InvalidTokenError,
    UnauthorizedAccessError
)

logger = logging.getLogger("civicfix.errors")


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


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handler for Pydantic RequestValidationError (422) formatting error messages nicely.
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    errors = exc.errors()
    first_msg = errors[0].get("msg", "Invalid input data provided.") if errors else "Invalid request format."
    field = errors[0].get("loc", [])[-1] if errors and errors[0].get("loc") else ""

    message = f"Validation error on field '{field}': {first_msg}" if field else first_msg

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": message,
                "timestamp": timestamp,
                "path": str(request.url.path)
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all exception handler for unexpected 500 errors.
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    logger.error(f"Unhandled Internal Server Exception at {request.url.path}: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": f"Server database/system error: {str(exc)}",
                "timestamp": timestamp,
                "path": str(request.url.path)
            }
        }
    )
