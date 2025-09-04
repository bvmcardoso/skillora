from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.infrastructure.db import get_db

from . import schemas, services
from .models import User

router = APIRouter(tags=["Users"])


@router.post("/", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    return await services.create_user(db, user_data)


@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    return await services.authenticate_user(db, form_data.username, form_data.password)


@router.get("/me", response_model=schemas.UserOut)
async def get_me(current_user: User = Depends(services.get_current_user)):
    return await current_user


# @router.post("/login")
# def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
#     return services.authenticate_user(db, user_data.email, user_data.password)
