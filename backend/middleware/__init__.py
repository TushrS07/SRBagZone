from typing import Optional
from fastapi import Cookie, Depends, Header, HTTPException, status
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from config import settings
from database import get_session
from models.user import User


def _extract_token(authorization: Optional[str], cookie_token: Optional[str]) -> str:
    if cookie_token:
        return cookie_token
    if authorization and authorization.startswith("Bearer "):
        return authorization.removeprefix("Bearer ").strip()
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"message": "Not authenticated"},
        headers={"WWW-Authenticate": "Bearer"},
    )


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={"message": "Token has expired"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail={"message": "Invalid token"},
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    srbag_token: Optional[str] = Cookie(default=None),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Authenticate any logged-in user (admin or customer)."""
    token = _extract_token(authorization, srbag_token)
    payload = _decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail={"message": "Invalid token"})

    result = await session.execute(
        select(User).where(User.id == int(user_id), User.is_active.is_(True))
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail={"message": "User not found"})
    return {
        "user_id": str(user.id),
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "role": user.role,
        "is_verified": user.is_verified,
    }


async def require_admin(current: dict = Depends(get_current_user)) -> dict:
    if current["role"] != "admin":
        raise HTTPException(status_code=403, detail={"message": "Admin role required"})
    return current


async def require_verified_customer(current: dict = Depends(get_current_user)) -> dict:
    if current["role"] != "customer":
        raise HTTPException(status_code=403, detail={"message": "Customer role required"})
    if not current["is_verified"]:
        raise HTTPException(
            status_code=403,
            detail={"message": "Please verify your email before continuing"},
        )
    return current
