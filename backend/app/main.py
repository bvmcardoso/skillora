from fastapi import FastAPI, APIRouter, Depends

from app.core.config import settings
from app.users.routes import router as users_router
from app.infrastructure.db import get_db
from sqlalchemy import text
from sqlalchemy.orm import Session


print("✅ Debugpy is listening on port 5678")

app = FastAPI()

api_router = APIRouter(prefix="/api")
api_router.include_router(users_router, prefix="/users")
app.include_router(api_router)

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

@app.get("/ping")
def ping(db: Session = Depends(get_db)):
    try: 
        db.execute(text("SELECT 1"))
        return {"message": "pong 🏓", "db": "ok"}
    except Exception as e:
        return {"message": "pong 🏓", "db": f"error {str(e)}"}
        
