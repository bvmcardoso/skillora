# API Endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session 

from . import schemas, services
from .models import User
from app.core.config import settings
from app.infrastructure.db import get_db
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model = schemas.UserOut, status_code = status.HTTP_201_CREATED)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    return services.create_user(db, user_data)


@router.post("/login")
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    return services.authenticate_user(db, user_data.email, user_data.password)

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: User = Depends(services.get_current_user)):
    return current_user

