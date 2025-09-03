# Skillora Analytics (Jobs)

Upload job salary datasets (CSV/XLSX), process them asynchronously, and explore insights via analytics APIs.  
**Stack:** FastAPI • Celery • Redis • Postgres • SQLAlchemy • Docker

[![CI](https://github.com/bvmcardoso/skillora/actions/workflows/ci.yml/badge.svg)](https://github.com/bvmcardoso/skillora/actions)

> Demo dataset: `backend/sample_data/jobs_dataset_reference.csv`

---

## Quick start

```bash
# 1) Start everything (backend, db, redis, worker)
make up

# 2) Apply database migrations
make migrate-up

# 3) (Optional) Open shells
make exec   # backend container
make psql   # Postgres shell
```

API will be available at: `http://localhost:8080`  
OpenAPI docs: `http://localhost:8080/docs`

---

## Project layout

```
backend/
├─ app/
│  ├─ core/               # Settings (env → pydantic)
│  ├─ infrastructure/     # DB engine/session
│  ├─ users/              # Users domain (auth, models, router)
│  ├─ jobs/               # Jobs domain (models, schemas, router, analytics)
│  ├─ workers/            # Celery app + tasks
│  ├─ migrations/         # Alembic
│  └─ main.py             # FastAPI app, routers
├─ requirements.txt
└─ sample_data/
   └─ jobs_dataset_reference.csv
```

---

## Environment

The app reads `backend/.env` (example values shown):

```
APP_NAME=skillora
ENVIRONMENT=development
DEBUG=True

DB_HOST=db
DB_PORT=5432
DB_NAME=skillora
DB_USER=user
DB_PASSWORD=password

REDIS_HOST=redis
REDIS_PORT=6379

UPLOAD_DIR=/data/uploads
```

Docker Compose binds `./data/uploads` → `/data/uploads` for backend and worker.

---

## How it works (MVP flow)

1. **Upload** a CSV/XLSX  
2. **Map** your file headers to the canonical schema  
3. **Worker** parses & inserts rows into `jobs`  
4. **Query** analytics endpoints

### Canonical columns
- `title` (str), `salary` (float USD), `currency` (default `USD`)  
- `country` (str), `seniority` (str), `stack` (comma-separated stack)

> Order in CSV doesn’t matter. Mapping is by **column name**.

---

## Using the APIs

### 1) Upload file
`POST /api/jobs/ingest/upload` (multipart form-data)

Form field: `file = <your CSV/XLSX>`

**cURL**
```bash
curl -F "file=@backend/sample_data/jobs_dataset_reference.csv" \
  http://localhost:8080/api/jobs/ingest/upload
# { "file_id": "<uuid>.csv" }
```

### 2) Map columns & process
`POST /api/jobs/ingest/map` (JSON)

**Body**
```json
{
  "file_id": "<uuid>.csv",
  "column_map": {
    "title": "job_title",
    "salary": "compensation",
    "currency": "currency",
    "country": "country",
    "seniority": "seniority",
    "stack": "stack"
  }
}
```

**cURL**
```bash
curl -X POST http://localhost:8080/api/jobs/ingest/map \
  -H "Content-Type: application/json" \
  -d @- <<'JSON'
{
  "file_id": "<paste-file-id-here>",
  "column_map": {
    "title": "job_title",
    "salary": "compensation",
    "currency": "currency",
    "country": "country",
    "seniority": "seniority",
    "stack": "stack"
  }
}
JSON
# { "task_id": "...", "status": "queued" }
```

### 3) Check task status
`GET /api/jobs/ingest/tasks/{task_id}`

**cURL**
```bash
curl http://localhost:8080/api/jobs/ingest/tasks/<task_id>
# { "id":"...","state":"SUCCESS","result":{"inserted":200, ...} }
```

### 4) Analytics

**Salary summary**  
`GET /api/jobs/analytics/salary/summary?title=&country=&stack=`

Returns `{ "p50": ..., "p75": ..., "p90": ..., "n": ... }`

**cURL**
```bash
curl "http://localhost:8080/api/jobs/analytics/salary/summary?title=Engineer&country=USA"
```

**Stack compare**  
`GET /api/jobs/analytics/stack/compare?title=&country=`

Returns `[{"stack":"Python,FastAPI,React","p50":..., "n":...}, ...]`

**cURL**
```bash
curl "http://localhost:8080/api/jobs/analytics/stack/compare?title=Engineer"
```

---

## Makefile shortcuts

```bash
make up              # build & start
make down            # stop
make rebuild         # rebuild without cache
make reset           # drop volumes & rebuild
make exec            # shell into backend
make psql            # psql into DB
make logs            # tail backend logs

make migrate-create name="add_index"  # new migration
make migrate-up                       # upgrade head
make migrate-down                     # downgrade last
make migrate-status                   # current revision
```

---

## Notes

- **Uploads are not versioned**: `data/uploads/` is runtime; keep one sample dataset in `backend/sample_data/`.
- **Celery worker** is a separate service in Docker and shares the uploads volume.
- This repo currently focuses on **backend + ingestion + analytics**. Frontend and CI badges can be layered on top.

---

## Roadmap (next)

- Frontend: upload wizard (preview → map → status) + dashboard (charts)
- CI/CD: GitHub Actions (lint, tests, build)
- More analytics: filters, time slicing, currency normalization
