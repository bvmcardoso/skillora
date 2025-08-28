# Business rules (Create user, authenticate)
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import cast

from .models import User
from .schemas import UserCreate
from .auth import create_access_token, hash_password, verify_password
from app.core.config import settings
from app.infrastructure.db import get_db



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")

async def get_current_user(db:AsyncSession = Depends(get_db), token: str= Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers = {"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email = payload.get("sub")
        if not isinstance(email, str):
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_result = await db.execute(select(User).where(User.email == email))
    user = user_result.scalars().first()
    if user is None:
        raise credentials_exception
    return user


async def create_user(db: AsyncSession, user_data: UserCreate):
    user_result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = user_result.scalars().first()

    if existing_user:
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST,
                            detail = 'Email already registered')    
    
    hashed_pw = hash_password(user_data.password)
    user = User(email=user_data.email, hashed_password = hashed_pw, full_name=user_data.full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def authenticate_user(db: AsyncSession, email: str, password: str):
    user_result = await db.execute(select(User).where(User.email == email))
    user = user_result.scalars().first()
    if not user or not verify_password(password, cast(str, user.hashed_password)):
        raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    
    access_token = await create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
    


