import debugpy
from fastapi import FastAPI
from app.core.config import settings

debugpy.listen(("0.0.0.0", 5678))
print("✅ Debugpy is listening on port 5678")

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
