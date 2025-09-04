# Pydantic schemas (Input/Output) - Serializers
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


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
        model_config = ConfigDict(from_attributes=True)


class UserRead(UserOut):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str
