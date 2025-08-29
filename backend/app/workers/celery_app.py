from celery import Celery
from app.core.config import settings

celery = Celery(
    "skillora",
    broker=f"redis://{settings.redis_host}:{settings.redis_port}/0",
    backend=f"redis://{settings.redis_host}:{settings.redis_port}/0",
)

celery.conf.update(include=["app.workers.tasks"], task_default_queue="celery")
