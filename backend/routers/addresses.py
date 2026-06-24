from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, update as sql_update
from middleware import get_current_user
from database import get_session
from models.address import Address
from schemas.address import AddressCreate, AddressUpdate

router = APIRouter(prefix="/api/addresses", tags=["addresses"])
Session = Annotated[AsyncSession, Depends(get_session)]
CurrentUser = Annotated[dict, Depends(get_current_user)]


def _fmt(a: Address) -> dict:
    return {
        "id": str(a.id),
        "user_id": str(a.user_id),
        "full_name": a.full_name,
        "phone": a.phone,
        "address_line1": a.address_line1,
        "address_line2": a.address_line2,
        "city": a.city,
        "state": a.state,
        "pincode": a.pincode,
        "is_default": a.is_default,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@router.get("/me", summary="List my addresses")
async def list_my_addresses(current: CurrentUser, session: Session):
    uid = int(current["user_id"])
    result = await session.execute(
        select(Address).where(Address.user_id == uid).order_by(Address.is_default.desc(), Address.id.desc())
    )
    return [_fmt(a) for a in result.scalars().all()]


@router.post("", status_code=201, summary="Create a new address for the signed-in user")
async def create_address(body: AddressCreate, current: CurrentUser, session: Session):
    uid = int(current["user_id"])
    if body.is_default:
        # Clear default on other addresses
        await session.execute(
            sql_update(Address).where(Address.user_id == uid).values(is_default=False)
        )
    a = Address(user_id=uid, **body.model_dump())
    session.add(a)
    await session.commit()
    await session.refresh(a)
    return _fmt(a)


@router.put("/{aid}", summary="Update an address")
async def update_address(aid: str, body: AddressUpdate, current: CurrentUser, session: Session):
    try:
        i = int(aid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid address ID"})
    uid = int(current["user_id"])
    result = await session.execute(select(Address).where(Address.id == i, Address.user_id == uid))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail={"message": "Address not found"})
    updates = body.model_dump(exclude_unset=True)
    if updates.get("is_default"):
        await session.execute(
            sql_update(Address).where(Address.user_id == uid, Address.id != i).values(is_default=False)
        )
    for k, v in updates.items():
        setattr(a, k, v)
    session.add(a)
    await session.commit()
    await session.refresh(a)
    return _fmt(a)


@router.delete("/{aid}", status_code=204, summary="Delete an address")
async def delete_address(aid: str, current: CurrentUser, session: Session):
    try:
        i = int(aid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid address ID"})
    uid = int(current["user_id"])
    result = await session.execute(select(Address).where(Address.id == i, Address.user_id == uid))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail={"message": "Address not found"})
    await session.delete(a)
    await session.commit()
