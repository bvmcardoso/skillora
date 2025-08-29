from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pathlib import Path
from uuid import uuid4
from app.core.config import settings
from app.workers.tasks import process_file
from pydantic import BaseModel, Field
from typing import Dict
from .schemas import MappingIn

router = APIRouter()


@router.post("/ingest/upload")
async def upload_job_file(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in {".csv", ".xls", ".xlsx"}:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Unsupported file type. Use CSV/XLSX/XLS."
        )

    uploads = Path("/data/uploads")
    uploads.mkdir(parents=True, exist_ok=True)

    file_id = f"{uuid4()}{ext}"
    dest = uploads / file_id
    content = await file.read()
    dest.write_bytes(content)

    return {"file_id": file_id}


@router.post("/ingest/map")
def map_job_columns(payload: MappingIn):
    # Queue async task
    task = process_file.delay(payload.file_id, payload.column_map)
    return {"task_id": task.id, "status": "queued"}
