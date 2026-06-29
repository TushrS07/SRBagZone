from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from middleware import require_admin
from database import get_session
from models.brand import Brand
from schemas.brand import BrandUpdate
from utils.media import upload_file

router = APIRouter(prefix="/api/brands", tags=["brands"])
Session = Annotated[AsyncSession, Depends(get_session)]
Admin = Annotated[dict, Depends(require_admin)]


def _fmt(b: Brand) -> dict:
    return {
        "id": str(b.id),
        "name": b.name,
        "description": b.description,
        "logo_url": b.logo_url,
        "is_active": b.is_active,
        "created_at": b.created_at.isoformat() if b.created_at else None,
    }


@router.get("", summary="List active brands")
async def list_brands(session: Session):
    result = await session.execute(
        select(Brand).where(Brand.is_active.is_(True)).order_by(Brand.name.asc())
    )
    return [_fmt(b) for b in result.scalars().all()]


@router.get("/{bid}", summary="Get a brand")
async def get_brand(bid: str, session: Session):
    try:
        i = int(bid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid brand ID"})
    result = await session.execute(select(Brand).where(Brand.id == i))
    b = result.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail={"message": "Brand not found"})
    return _fmt(b)


@router.post("", status_code=201, summary="Create a brand (admin)")
async def create_brand(
    admin: Admin,
    session: Session,
    name: str = Form(...),
    description: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
):
    existing = await session.execute(select(Brand).where(Brand.name == name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail={"message": "Brand name already exists"})
    logo_url = None
    if logo and logo.filename:
        asset = await upload_file(logo, folder="srbagzone/brands")
        if asset:
            logo_url = asset.url
    b = Brand(name=name, description=description, logo_url=logo_url)
    session.add(b)
    await session.commit()
    await session.refresh(b)
    return _fmt(b)


@router.put("/{bid}", summary="Update a brand (admin)")
async def update_brand(bid: str, body: BrandUpdate, admin: Admin, session: Session):
    try:
        i = int(bid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid brand ID"})
    result = await session.execute(select(Brand).where(Brand.id == i))
    b = result.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail={"message": "Brand not found"})
    updates = body.model_dump(exclude_unset=True)
    for k, v in updates.items():
        setattr(b, k, v)
    session.add(b)
    await session.commit()
    await session.refresh(b)
    return _fmt(b)


@router.delete("/{bid}", status_code=204, summary="Delete a brand (admin)")
async def delete_brand(bid: str, admin: Admin, session: Session):
    try:
        i = int(bid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid brand ID"})
    result = await session.execute(select(Brand).where(Brand.id == i))
    b = result.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail={"message": "Brand not found"})
    await session.delete(b)
    await session.commit()
