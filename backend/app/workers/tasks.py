from pathlib import Path
from app.workers.celery_app import celery


@celery.task(name="process_file")
def process_file(file_id: str, column_map: dict):
    path = Path("/data/uploads") / file_id
    exists = path.exists()
    return {
        "file_id": file_id,
        "exists": exists,
        "columns_received": list(column_map.keys()),
        "note": "Parsing & DB insert will be implemented soon",
    }
