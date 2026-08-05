import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from src.core.config import get_settings
from src.core.database import AsyncSessionFactory, engine
from src.domain.common.exceptions import DomainException
from src.infrastructure.persistence.base_model import BaseModel
import src.infrastructure.persistence.models.user_model
import src.infrastructure.persistence.models.issue_model
from src.infrastructure.persistence.seeder import seed_initial_data
from src.presentation.api.v1.router import api_v1_router
from src.presentation.middlewares.error_handler import (
    domain_exception_handler,
    general_exception_handler,
    validation_exception_handler
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager handling startup and shutdown procedures.
    Automatically creates database tables, migrates missing columns, and seeds default data on startup.
    """
    try:
        async with engine.begin() as conn:
            await conn.run_sync(BaseModel.metadata.create_all)

            # Safe auto-migration for missing columns on existing SQLite/DB tables
            columns_to_ensure = [
                ("users", "xp_points", "INTEGER DEFAULT 0 NOT NULL"),
                ("users", "reputation_rank", "VARCHAR(100) DEFAULT 'Civic Watcher' NOT NULL"),
                ("issues", "resolution_photo_url", "VARCHAR(512) NULL"),
                ("issues", "resolution_notes", "TEXT NULL"),
                ("issues", "citizen_rating", "INTEGER NULL"),
                ("issues", "citizen_feedback", "TEXT NULL"),
                ("issues", "reopen_count", "INTEGER DEFAULT 0 NOT NULL"),
            ]
            for table, column, col_type in columns_to_ensure:
                try:
                    await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                except Exception:
                    # Column already exists
                    pass

        async with AsyncSessionFactory() as session:
            await seed_initial_data(session)
    except Exception as exc:
        print(f"[CivicFix Startup Note] Database init: {exc}")
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

    # Ensure Uploads Directory Exists & Mount Static File Serving
    upload_dir = settings.MEDIA_UPLOAD_DIR if hasattr(settings, "MEDIA_UPLOAD_DIR") else "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

    # Register Exception Handlers
    app.add_exception_handler(DomainException, domain_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)

    # Include API Routers
    app.include_router(api_v1_router, prefix=settings.API_V1_STR)

    return app


app = create_application()
