import asyncio
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
import jwt
import bcrypt
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from config import settings
from database import get_session
from middleware import get_current_user
from models.user import User
from models.otp import OtpCode
from rate_limit import limiter
from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserProfile,
    AuthResponse,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    VerifyResetOtpRequest,
    VerifyResetOtpResponse,
    ResetPasswordRequest,
    SimpleMessage,
)
from utils.otp import generate_code, hash_code, verify_code
from job_queue import enqueue

router = APIRouter(prefix="/api/auth", tags=["auth"])
Session = Annotated[AsyncSession, Depends(get_session)]

RESET_TOKEN_TTL_MINUTES = 15


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


def _create_reset_token(user_id: str) -> str:
    """Short-lived token proving the user passed the reset-OTP step."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
    payload = {
        "sub": user_id,
        "purpose": "pwd_reset",
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


# ─── OTP helpers ──────────────────────────────────────────────────────────────
async def _issue_otp(session: AsyncSession, email: str, purpose: str, name: str) -> None:
    """Invalidate any prior code for (email, purpose), mint a new one, enqueue the email."""
    await session.execute(
        delete(OtpCode).where(
            OtpCode.email == email,
            OtpCode.purpose == purpose,
            OtpCode.consumed_at.is_(None),
        )
    )
    code = generate_code()
    session.add(OtpCode(
        email=email,
        purpose=purpose,
        code_hash=hash_code(code),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.otp_ttl_minutes),
    ))
    await session.commit()

    event = "verify_email_otp" if purpose == "verify_email" else "reset_password_otp"
    await enqueue(event, email, {"name": name, "code": code})


async def _consume_otp(session: AsyncSession, email: str, purpose: str, code: str) -> None:
    """Validate + consume the latest active code, or raise HTTPException."""
    result = await session.execute(
        select(OtpCode)
        .where(
            OtpCode.email == email,
            OtpCode.purpose == purpose,
            OtpCode.consumed_at.is_(None),
        )
        .order_by(OtpCode.created_at.desc())
    )
    otp = result.scalars().first()
    invalid = HTTPException(status_code=400, detail={"message": "Invalid or expired code"})
    if otp is None:
        raise invalid

    now = datetime.now(timezone.utc)
    if otp.expires_at < now:
        raise HTTPException(status_code=400, detail={"message": "Code has expired. Request a new one."})
    if otp.attempts >= otp.max_attempts:
        raise HTTPException(status_code=429, detail={"message": "Too many attempts. Request a new code."})

    if not verify_code(code, otp.code_hash):
        otp.attempts += 1
        session.add(otp)
        await session.commit()
        raise invalid

    otp.consumed_at = now
    session.add(otp)
    await session.commit()


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

    u = User(
        name=body.name,
        email=body.email.lower(),
        password_hash=hashed,
        phone=body.phone,
        role="customer",
        is_verified=False,
    )
    session.add(u)
    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise HTTPException(status_code=409, detail={"message": "An account with this email already exists"})
    await session.refresh(u)

    await _issue_otp(session, u.email, "verify_email", u.name)

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


# ─── Email verification (OTP) ───────────────────────────────────────────────
@router.post(
    "/verify-email",
    response_model=SimpleMessage,
    summary="Verify email with a 6-digit code",
)
@limiter.limit("10/10minute")
async def verify_email(request: Request, body: VerifyEmailRequest, session: Session):
    email = body.email.lower()
    result = await session.execute(select(User).where(User.email == email))
    u = result.scalar_one_or_none()
    if u is None:
        raise HTTPException(status_code=400, detail={"message": "Invalid or expired code"})
    if u.is_verified:
        return {"message": "Email already verified"}

    await _consume_otp(session, email, "verify_email", body.code)

    u.is_verified = True
    session.add(u)
    await session.commit()
    return {"message": "Email verified"}


@router.post(
    "/resend-verification",
    response_model=SimpleMessage,
    summary="Resend the email-verification code",
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

    await _issue_otp(session, u.email, "verify_email", u.name)
    return {"message": "Verification code sent"}


# ─── Password reset (OTP, two-step) ─────────────────────────────────────────
@router.post(
    "/forgot-password",
    response_model=SimpleMessage,
    summary="Request a password-reset code (always returns 200)",
)
@limiter.limit("5/hour")
async def forgot_password(request: Request, body: ForgotPasswordRequest, session: Session):
    result = await session.execute(select(User).where(User.email == body.email.lower()))
    u = result.scalar_one_or_none()
    if u is not None and u.is_active:
        await _issue_otp(session, u.email, "reset_password", u.name)
    return {"message": "If that email is registered, a reset code has been sent."}


@router.post(
    "/verify-reset-otp",
    response_model=VerifyResetOtpResponse,
    summary="Verify the reset code, receive a short-lived reset token",
)
@limiter.limit("10/10minute")
async def verify_reset_otp(request: Request, body: VerifyResetOtpRequest, session: Session):
    email = body.email.lower()
    result = await session.execute(select(User).where(User.email == email))
    u = result.scalar_one_or_none()
    if u is None:
        raise HTTPException(status_code=400, detail={"message": "Invalid or expired code"})

    await _consume_otp(session, email, "reset_password", body.code)
    return VerifyResetOtpResponse(reset_token=_create_reset_token(str(u.id)))


@router.post(
    "/reset-password",
    response_model=SimpleMessage,
    summary="Set a new password using a reset token",
)
@limiter.limit("5/hour")
async def reset_password(request: Request, body: ResetPasswordRequest, session: Session):
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail={"message": "Password must be at least 6 characters"})

    expired = HTTPException(status_code=400, detail={"message": "Reset session is invalid or has expired"})
    try:
        payload = jwt.decode(body.reset_token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.InvalidTokenError:
        raise expired
    if payload.get("purpose") != "pwd_reset":
        raise expired
    user_id = payload.get("sub")
    if not user_id:
        raise expired

    result = await session.execute(select(User).where(User.id == int(user_id)))
    u = result.scalar_one_or_none()
    if u is None:
        raise expired

    loop = asyncio.get_running_loop()
    u.password_hash = await loop.run_in_executor(None, lambda: _bcrypt_hash(body.new_password))
    session.add(u)
    await session.commit()
    return {"message": "Password updated"}
