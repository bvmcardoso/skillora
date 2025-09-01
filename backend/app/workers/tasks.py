import pandas as pd
from pathlib import Path
from typing import Any, Dict, List, cast
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.workers.celery_app import celery
from app.core.config import settings
from app.jobs.models import Job

CANON: list[str] = ["title", "salary", "currency", "country", "seniority", "stack"]


def _load_dataframe(path: Path) -> pd.DataFrame:
    suf = path.suffix.lower()
    if suf == ".csv":
        return pd.read_csv(path)
    if suf in {".xlsx", ".xls"}:
        return pd.read_excel(path)
    raise ValueError(f"Unsupported file type: {path.suffix}")


def _normalize(df: pd.DataFrame) -> pd.DataFrame:
    # keep only known columns
    cols: list[str] = [c for c in CANON if c in df.columns]
    df = cast(pd.DataFrame, df.loc[:, cols].copy())

    # basic cleaning
    if "salary" in df.columns:
        df["salary"] = pd.to_numeric(df["salary"], errors="coerce")
        df = cast(pd.DataFrame, df.loc[df["salary"].notna()].copy())

    for col in ("title", "country", "seniority", "stack", "currency"):
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    if "currency" in df.columns:
        df["currency"] = df["currency"].replace({None: "USD", "": "USD"}).fillna("USD")

    return df


@celery.task(name="process_file")
def process_file(file_id: str, column_map: Dict[str, str]) -> Dict[str, Any]:
    uploads = Path(settings.upload_dir)
    path = uploads / file_id
    if not path.exists():
        return {"file_id": file_id, "error": "file not found"}

    df = _load_dataframe(path)

    # column_map: CANON -> file_name
    rename_map: Dict[str, str] = {
        canon: src
        for canon, src in column_map.items()
        if canon in CANON and src in df.columns
    }
    if not rename_map:
        return {
            "file_id": file_id,
            "error": "invalid mapping",
            "columns": list(df.columns),
        }

    df = df.rename(columns={v: k for k, v in rename_map.items()})
    df = _normalize(df)

    if df.empty:
        return {
            "file_id": file_id,
            "inserted": 0,
            "note": "no valid rows after normalization",
        }

    # Using sync engine inside the worker
    engine = create_engine(
        settings.alembic_database_url, pool_pre_ping=True, future=True
    )

    inserted = 0
    with Session(engine) as session:
        # chunked insert to keep memory reasonable
        chunk_size = 1000
        records: List[Dict[str, Any]] = cast(List[Dict[str, Any]], df.to_dict(orient="records"))  # type: ignore[call-overload]
        for i in range(0, len(records), chunk_size):
            chunk = records[i : i + chunk_size]
            objs = [
                Job(**row) for row in chunk
            ]  # row: Dict[str, Any] -> ok para **kwargs
            session.bulk_save_objects(objs)
            session.commit()
            inserted += len(objs)

    return {
        "file_id": file_id,
        "inserted": inserted,
        "sample": records[:3],
    }
