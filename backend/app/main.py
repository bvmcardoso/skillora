from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.users.router import router as users_router
from app.jobs.router import router as jobs_router
from app.infrastructure.db import get_db
from sqlalchemy import text
from sqlalchemy.orm import Session


print("Debugpy is listening on port 5678")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,  # deixe True só se usar cookies/aut no navegador
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
api_router.include_router(users_router, prefix="/users")
api_router.include_router(jobs_router, prefix="/jobs")
app.include_router(api_router)


@app.get("/")
async def root():
    return {"message": "Skillora analytics backend is running"}


@app.get("/config")
async def config():
    return {
        "app": settings.app_name,
        "env": settings.environment,
        "debug": settings.debug,
    }


@app.get("/health")
async def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"message": "ok", "db": "ok"}
    except Exception as e:
        return {"message": "ok", "db": f"error {str(e)}"}
