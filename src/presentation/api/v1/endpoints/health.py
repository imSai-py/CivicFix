from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.config import get_settings
from src.core.database import get_db_session

settings = get_settings()
router = APIRouter(tags=["Health"])


@router.get("/health", status_code=200)
async def health_check(session: AsyncSession = Depends(get_db_session)):
    """
    Liveness & readiness system health probe.
    Executes a lightweight DB query to verify database connectivity.
    """
    db_status = "connected"
    try:
        await session.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
