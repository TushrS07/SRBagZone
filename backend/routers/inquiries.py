from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from middleware import require_admin
from database import get_session
from config import settings
from rate_limit import limiter
from models.inquiry import Inquiry
from schemas.inquiry import InquiryCreate
from job_queue import enqueue


router = APIRouter(prefix="/api/inquiries", tags=["inquiries"])
admin_router = APIRouter(prefix="/api/admin/inquiries", tags=["admin-inquiries"])

Session = Annotated[AsyncSession, Depends(get_session)]
Admin = Annotated[dict, Depends(require_admin)]


def _fmt(i: Inquiry) -> dict:
    return {
        "id": str(i.id),
        "name": i.name,
        "phone": i.phone,
        "email": i.email,
        "requirement": i.requirement,
        "message": i.message,
        "is_read": i.is_read,
        "created_at": i.created_at.isoformat() if i.created_at else None,
    }


# ─── Public: submit an inquiry ──────────────────────────────────────────────
@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Submit a contact inquiry",
    description="Public endpoint. Rate-limited to 5/hour per IP to prevent abuse.",
)
@limiter.limit("5/hour")
async def create_inquiry(request: Request, body: InquiryCreate, session: Session):
    inq = Inquiry(**body.model_dump())
    session.add(inq)
    await session.commit()
    await session.refresh(inq)

    if settings.admin_email:
        await enqueue("admin_new_inquiry", settings.admin_email, {
            "name": inq.name,
            "email": inq.email,
            "phone": inq.phone,
            "requirement": inq.requirement,
            "message": inq.message,
        })

    return _fmt(inq)


# ─── Admin: list / mark read / delete ───────────────────────────────────────
@admin_router.get("", summary="List all inquiries (newest first)")
async def list_inquiries(admin: Admin, session: Session):
    result = await session.execute(
        select(Inquiry).order_by(Inquiry.created_at.desc()).limit(500)
    )
    return [_fmt(i) for i in result.scalars().all()]


@admin_router.get("/unread-count", summary="Count of unread inquiries")
async def unread_count(admin: Admin, session: Session):
    result = await session.execute(
        select(func.count()).select_from(Inquiry).where(Inquiry.is_read.is_(False))
    )
    return {"count": int(result.scalar() or 0)}


@admin_router.patch("/{iid}/toggle-read", summary="Toggle the read status of an inquiry")
async def toggle_read(iid: str, admin: Admin, session: Session):
    try:
        i = int(iid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid inquiry ID"})
    result = await session.execute(select(Inquiry).where(Inquiry.id == i))
    inq = result.scalar_one_or_none()
    if inq is None:
        raise HTTPException(status_code=404, detail={"message": "Inquiry not found"})
    inq.is_read = not inq.is_read
    session.add(inq)
    await session.commit()
    await session.refresh(inq)
    return _fmt(inq)


@admin_router.delete("/{iid}", status_code=204, summary="Delete an inquiry")
async def delete_inquiry(iid: str, admin: Admin, session: Session):
    try:
        i = int(iid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid inquiry ID"})
    result = await session.execute(select(Inquiry).where(Inquiry.id == i))
    inq = result.scalar_one_or_none()
    if inq is None:
        raise HTTPException(status_code=404, detail={"message": "Inquiry not found"})
    await session.delete(inq)
    await session.commit()
