from fastapi import FastAPI
from app.core.config import settings

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Skillora backend is running"}


@app.get("/config")
def config():
    return {
        "app": settings.app_name,
        "env": settings.environment,
        "debug": settings.debug,
    }
