import re
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str

    @field_validator("phone")
    @classmethod
    def phone_required(cls, v: str) -> str:
        v = (v or "").strip()
        if len(re.sub(r"\D", "", v)) < 7:
            raise ValueError("A valid phone number is required")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_verified: bool = False


class AuthResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user: UserProfile


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyResetOtpRequest(BaseModel):
    email: EmailStr
    code: str


class VerifyResetOtpResponse(BaseModel):
    reset_token: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


class SimpleMessage(BaseModel):
    message: str
