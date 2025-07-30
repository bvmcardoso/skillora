from sqlalchemy import create_engine 
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# SQLAlchemy connection url
DATABASE_URL = settings.database_url
engine = create_engine(DATABASE_URL, echo=settings.debug)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

from app.users import models as users_models
from app.skills import models as skills_models

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
