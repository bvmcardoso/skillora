from celery import Celery

from app.core.config import settings

celery = Celery(
    "skillora",
    broker=f"redis://{settings.redis_host}:{settings.redis_port}/0",
    backend=f"redis://{settings.redis_host}:{settings.redis_port}/0",
)

celery.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    worker_prefetch_multiplier=1,  # smoother process on large files
    include=["app.workers.tasks"],
    task_default_queue="celery",
)
