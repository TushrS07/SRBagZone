import asyncio
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
import jwt
import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from config import settings
from database import get_session
from middleware import get_current_user
from models.user import User
from rate_limit import limiter
from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserProfile,
    AuthResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SimpleMessage,
)
from utils.email_util import send_email

router = APIRouter(prefix="/api/auth", tags=["auth"])
Session = Annotated[AsyncSession, Depends(get_session)]


def _create_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _set_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="srbag_token",
        value=token,
        max_age=settings.jwt_expire_minutes * 60,
        httponly=True,
        samesite="lax",
        secure=(settings.app_env == "production"),
        path="/",
    )


def _profile(u: User) -> UserProfile:
    return UserProfile(
        id=str(u.id),
        name=u.name,
        email=u.email,
        phone=u.phone,
        role=u.role,
        is_verified=u.is_verified,
    )


def _bcrypt_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# ─── Register ───────────────────────────────────────────────────────────────
@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Customer sign-up",
)
@limiter.limit("3/10minute")
async def register(request: Request, response: Response, body: RegisterRequest, session: Session):
    existing = await session.execute(select(User).where(User.email == body.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail={"message": "An account with this email already exists"})

    loop = asyncio.get_running_loop()
    hashed = await loop.run_in_executor(None, lambda: _bcrypt_hash(body.password))
    verification_token = secrets.token_urlsafe(32)

    u = User(
        name=body.name,
        email=body.email.lower(),
        password_hash=hashed,
        phone=body.phone,
        role="customer",
        is_verified=False,
        verification_token=verification_token,
    )
    session.add(u)
    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise HTTPException(status_code=409, detail={"message": "An account with this email already exists"})
    await session.refresh(u)

    verify_link = f"{settings.frontend_url}/verify-email?token={verification_token}"
    send_email(
        to=u.email,
        subject="Verify your SR Bag Zone account",
        body=f"Hi {u.name},\n\nVerify your email:\n\n  {verify_link}\n",
    )

    token = _create_token(str(u.id), u.email, u.role)
    _set_cookie(response, token)
    return AuthResponse(token=token, user=_profile(u))


# ─── Login (both customer and admin use this) ───────────────────────────────
@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login — works for both admin and customer roles",
)
@limiter.limit("5/minute")
async def login(request: Request, response: Response, body: LoginRequest, session: Session):
    invalid = HTTPException(status_code=401, detail={"message": "Invalid email or password"})
    result = await session.execute(select(User).where(User.email == body.email.lower()))
    u = result.scalar_one_or_none()
    if u is None:
        raise invalid
    if not u.is_active:
        raise HTTPException(status_code=403, detail={"message": "Account is disabled"})

    loop = asyncio.get_running_loop()
    valid = await loop.run_in_executor(
        None,
        lambda: bcrypt.checkpw(body.password.encode("utf-8"), u.password_hash.encode("utf-8")),
    )
    if not valid:
        raise invalid

    token = _create_token(str(u.id), u.email, u.role)
    _set_cookie(response, token)
    return AuthResponse(token=token, user=_profile(u))


@router.post(
    "/logout",
    response_model=SimpleMessage,
    summary="Logout — clears the auth cookie",
)
async def logout(response: Response):
    response.delete_cookie("srbag_token", path="/")
    return {"message": "Logged out"}


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Current user profile",
)
async def me(current: dict = Depends(get_current_user)):
    return UserProfile(
        id=current["user_id"],
        name=current["name"],
        email=current["email"],
        phone=current.get("phone"),
        role=current["role"],
        is_verified=current["is_verified"],
    )


# ─── Email verification ─────────────────────────────────────────────────────
@router.get(
    "/verify-email",
    response_model=SimpleMessage,
    summary="Consume verification token",
)
async def verify_email(token: str, session: Session):
    if not token:
        raise HTTPException(status_code=400, detail={"message": "Missing token"})
    result = await session.execute(select(User).where(User.verification_token == token))
    u = result.scalar_one_or_none()
    if u is None:
        raise HTTPException(status_code=400, detail={"message": "Invalid or already-used verification link"})
    u.is_verified = True
    u.verification_token = None
    session.add(u)
    await session.commit()
    return {"message": "Email verified"}


@router.post(
    "/resend-verification",
    response_model=SimpleMessage,
    summary="Resend verification email",
)
@limiter.limit("3/10minute")
async def resend_verification(
    request: Request,
    session: Session,
    current: dict = Depends(get_current_user),
):
    result = await session.execute(select(User).where(User.id == int(current["user_id"])))
    u = result.scalar_one_or_none()
    if u is None:
        raise HTTPException(status_code=404, detail={"message": "User not found"})
    if u.is_verified:
        return {"message": "Already verified"}
    u.verification_token = secrets.token_urlsafe(32)
    session.add(u)
    await session.commit()

    link = f"{settings.frontend_url}/verify-email?token={u.verification_token}"
    send_email(to=u.email, subject="Verify your SR Bag Zone account",
               body=f"Hi {u.name},\n\nVerify your email:\n\n  {link}\n")
    return {"message": "Verification email sent"}


# ─── Password reset ─────────────────────────────────────────────────────────
@router.post(
    "/forgot-password",
    response_model=SimpleMessage,
    summary="Request a password reset link (always returns 200)",
)
@limiter.limit("5/hour")
async def forgot_password(request: Request, body: ForgotPasswordRequest, session: Session):
    result = await session.execute(select(User).where(User.email == body.email.lower()))
    u = result.scalar_one_or_none()
    if u is not None and u.is_active:
        u.reset_token = secrets.token_urlsafe(32)
        u.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        session.add(u)
        await session.commit()
        link = f"{settings.frontend_url}/reset-password?token={u.reset_token}"
        send_email(
            to=u.email,
            subject="Reset your SR Bag Zone password",
            body=(
                f"Hi {u.name},\n\nReset your password (expires in 1 hour):\n\n"
                f"  {link}\n\nIf you didn't request this, you can ignore this email."
            ),
        )
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post(
    "/reset-password",
    response_model=SimpleMessage,
    summary="Consume reset token + set new password",
)
@limiter.limit("5/hour")
async def reset_password(request: Request, body: ResetPasswordRequest, session: Session):
    if not body.token or len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail={"message": "Token required + password must be at least 6 chars"})
    result = await session.execute(select(User).where(User.reset_token == body.token))
    u = result.scalar_one_or_none()
    if u is None or u.reset_token_expires is None or u.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail={"message": "Reset link is invalid or has expired"})
    loop = asyncio.get_running_loop()
    u.password_hash = await loop.run_in_executor(None, lambda: _bcrypt_hash(body.new_password))
    u.reset_token = None
    u.reset_token_expires = None
    session.add(u)
    await session.commit()
    return {"message": "Password updated"}
