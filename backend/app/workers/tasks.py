from pathlib import Path
from app.workers.celery_app import celery
from app.core.config import settings


@celery.task(name="process_file")
def process_file(file_id: str, column_map: dict):
    path = Path(settings.upload_dir) / file_id
    exists = path.exists()

    return {
        "file_id": file_id,
        "exists": exists,
        "columns_received": list(column_map.keys()),
        "note": "Parsing & DB insert will be implemented soon",
    }
