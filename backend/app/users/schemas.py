# Pydantic schemas (Input/Output) - Serializers
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# Used for user creation:
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True


class UserRead(UserOut):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str


