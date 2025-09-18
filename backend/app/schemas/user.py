from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    confirm_password: str

class UserLogin(BaseModel):
    email_or_phone: str
    password: str

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str
    is_active: bool
    is_admin: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None