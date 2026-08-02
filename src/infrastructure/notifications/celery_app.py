from celery import Celery
from src.core.config import get_settings

settings = get_settings()

redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"

celery_app = Celery(
    "civicfix_tasks",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_always_eager=True if settings.ENVIRONMENT == "testing" else False,
    task_eager_propagates=True
)
