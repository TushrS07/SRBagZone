from datetime import datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from middleware import require_admin
from database import get_session
from models.category import Category
from schemas.category import CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/api/categories", tags=["categories"])
Session = Annotated[AsyncSession, Depends(get_session)]
Admin = Annotated[dict, Depends(require_admin)]


def _fmt(c: Category) -> dict:
    return {
        "id": str(c.id),
        "name": c.name,
        "description": c.description,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@router.get("", summary="List all categories")
async def list_categories(session: Session):
    result = await session.execute(select(Category).order_by(Category.name.asc()))
    return [_fmt(c) for c in result.scalars().all()]


@router.get("/{cid}", summary="Get a single category")
async def get_category(cid: str, session: Session):
    try:
        i = int(cid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid category ID"})
    result = await session.execute(select(Category).where(Category.id == i))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail={"message": "Category not found"})
    return _fmt(c)


@router.post("", status_code=201, summary="Create a category (admin)")
async def create_category(body: CategoryCreate, admin: Admin, session: Session):
    existing = await session.execute(select(Category).where(Category.name == body.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail={"message": "Category name already exists"})
    c = Category(name=body.name, description=body.description)
    session.add(c)
    await session.commit()
    await session.refresh(c)
    return _fmt(c)


@router.put("/{cid}", summary="Update a category (admin)")
async def update_category(cid: str, body: CategoryUpdate, admin: Admin, session: Session):
    try:
        i = int(cid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid category ID"})
    result = await session.execute(select(Category).where(Category.id == i))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail={"message": "Category not found"})
    updates = body.model_dump(exclude_unset=True)
    for k, v in updates.items():
        setattr(c, k, v)
    session.add(c)
    await session.commit()
    await session.refresh(c)
    return _fmt(c)


@router.delete("/{cid}", status_code=204, summary="Delete a category (admin)")
async def delete_category(cid: str, admin: Admin, session: Session):
    try:
        i = int(cid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid category ID"})
    result = await session.execute(select(Category).where(Category.id == i))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail={"message": "Category not found"})
    await session.delete(c)
    await session.commit()
