from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import get_settings
from src.core.database import engine
from src.domain.common.exceptions import DomainException
from src.presentation.api.v1.router import api_v1_router
from src.presentation.middlewares.error_handler import (
    domain_exception_handler,
    validation_exception_handler
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager handling startup and shutdown procedures.
    """
    yield
    await engine.dispose()


def create_application() -> FastAPI:
    """
    FastAPI Application Factory function.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        debug=settings.DEBUG,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan
    )

    # CORS Middleware Setup
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register Exception Handlers
    app.add_exception_handler(DomainException, domain_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    # Include API Routers
    app.include_router(api_v1_router, prefix=settings.API_V1_STR)

    return app


app = create_application()
