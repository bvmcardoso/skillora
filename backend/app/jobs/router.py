from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from celery.result import AsyncResult
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.infrastructure.db import get_db
from app.jobs.models import Job
from app.workers.celery_app import celery
from app.workers.tasks import process_file

from .schemas import MappingIn

router = APIRouter()


@router.post("/ingest/upload")
async def upload_job_file(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in {".csv", ".xls", ".xlsx"}:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Unsupported file type. Use CSV/XLSX/XLS."
        )

    uploads = Path(settings.upload_dir)
    uploads.mkdir(parents=True, exist_ok=True)

    file_id = f"{uuid4()}{ext}"
    dest = uploads / file_id
    content = await file.read()
    dest.write_bytes(content)

    return {"file_id": file_id}


@router.post("/ingest/map")
def map_job_columns(payload: MappingIn):
    # Queue async task
    task = process_file.apply_async(
        kwargs={
            "file_id": payload.file_id,
            "column_map": dict(payload.column_map),
        }
    )
    return {"task_id": task.id, "status": "queued"}


@router.get("/analytics/salary/summary")
async def salary_summary(
    title: Optional[str] = None,
    country: Optional[str] = None,
    stack: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    q = select(
        func.percentile_cont(0.5).within_group(Job.salary).label("p50"),
        func.percentile_cont(0.75).within_group(Job.salary).label("p75"),
        func.percentile_cont(0.9).within_group(Job.salary).label("p90"),
        func.count().label("n"),
    )

    q = q.where(Job.salary.isnot(None))

    if title:
        q = q.where(Job.title.ilike(f"%{title}%"))
    if country:
        q = q.where(Job.country.ilike(f"%{country}%"))
    if stack:
        q = q.where(Job.stack.ilike(f"%{stack}%"))

    res = await db.execute(q)
    row = res.mappings().first()
    return dict(row) if row else {"p50": None, "p75": None, "p90": None, "n": 0}


@router.get("/analytics/stack/compare")
async def stack_compare(
    title: Optional[str] = None,
    country: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> List[Dict[str, Any]]:
    q = (
        select(
            Job.stack.label("stack"),
            func.percentile_cont(0.5).within_group(Job.salary).label("p50"),
            func.count().label("n"),
        )
        .group_by(Job.stack)
        .order_by(func.percentile_cont(0.5).within_group(Job.salary).desc())
    )

    q = q.where(Job.salary.isnot(None))

    if title:
        q = q.where(Job.title.ilike(f"%{title}%"))
    if country:
        q = q.where(Job.country.ilike(f"%{country}%"))

    res = await db.execute(q)
    return [dict(r) for r in res.mappings().all()]


@router.get("/ingest/tasks/{task_id}")
def get_task_status(task_id: str):
    r = AsyncResult(task_id, app=celery)

    meta = r.info if isinstance(r.info, dict) else None

    payload = {
        "id": task_id,
        "state": r.state,  # PENDING | STARTED | PROGRESS | RETRY | FAILURE | SUCCESS
        "meta": meta,
        "ready": r.ready(),
        "successful": r.ready() and r.successful(),
    }

    if r.ready():
        payload["result"] = r.result

    return payload
