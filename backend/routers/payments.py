from datetime import datetime, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from middleware import require_admin, require_verified_customer
from database import get_session
from models.payment import Payment
from models.order import Order
from schemas.payment import PaymentDecision
from utils.media import upload_file

router = APIRouter(prefix="/api", tags=["payments"])
Session = Annotated[AsyncSession, Depends(get_session)]
Customer = Annotated[dict, Depends(require_verified_customer)]
Admin = Annotated[dict, Depends(require_admin)]


def _fmt(p: Payment) -> dict:
    return {
        "id": str(p.id),
        "order_id": str(p.order_id),
        "payment_method": p.payment_method,
        "upi_reference_number": p.upi_reference_number,
        "screenshot_url": p.screenshot_url,
        "amount": float(p.amount),
        "payment_status": p.payment_status,
        "verified_by": str(p.verified_by) if p.verified_by else None,
        "verified_at": p.verified_at.isoformat() if p.verified_at else None,
        "remarks": p.remarks,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


# ─── Customer: submit a payment for an order ────────────────────────────────
@router.post(
    "/orders/{oid}/payment",
    status_code=201,
    summary="Submit a payment for an order (UPI screenshot)",
)
async def submit_payment(
    oid: str,
    current: Customer,
    session: Session,
    upi_reference_number: Optional[str] = Form(None),
    screenshot: UploadFile = File(...),
):
    try:
        order_id = int(oid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid order ID"})

    order_row = await session.execute(select(Order).where(Order.id == order_id))
    order = order_row.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail={"message": "Order not found"})
    if order.user_id != int(current["user_id"]):
        raise HTTPException(status_code=403, detail={"message": "Not your order"})

    # If a payment already exists, update it; else insert.
    existing_row = await session.execute(select(Payment).where(Payment.order_id == order_id))
    existing = existing_row.scalar_one_or_none()
    if existing and existing.payment_status == "confirmed":
        raise HTTPException(status_code=409, detail={"message": "Payment already confirmed"})

    asset = await upload_file(screenshot, folder="srbagzone/payment-screenshots")
    if not asset:
        raise HTTPException(status_code=400, detail={"message": "Screenshot upload failed"})

    if existing:
        existing.upi_reference_number = upi_reference_number
        existing.screenshot_url = asset.url
        existing.payment_status = "pending_confirmation"
        existing.remarks = None
        existing.verified_by = None
        existing.verified_at = None
        session.add(existing)
        order.payment_status = "pending_confirmation"
        session.add(order)
        await session.commit()
        await session.refresh(existing)
        return _fmt(existing)

    pay = Payment(
        order_id=order_id,
        payment_method="UPI",
        upi_reference_number=upi_reference_number,
        screenshot_url=asset.url,
        amount=order.total_amount,
        payment_status="pending_confirmation",
    )
    session.add(pay)
    order.payment_status = "pending_confirmation"
    session.add(order)
    await session.commit()
    await session.refresh(pay)
    return _fmt(pay)


# ─── Admin verification ─────────────────────────────────────────────────────
@router.get("/admin/payments", summary="List all payments")
async def list_payments(admin: Admin, session: Session):
    result = await session.execute(select(Payment).order_by(Payment.created_at.desc()).limit(500))
    return [_fmt(p) for p in result.scalars().all()]


@router.patch("/admin/payments/{pid}/confirm", summary="Confirm a payment")
async def confirm_payment(pid: str, body: PaymentDecision, admin: Admin, session: Session):
    try:
        i = int(pid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid payment ID"})
    pay_row = await session.execute(select(Payment).where(Payment.id == i))
    pay = pay_row.scalar_one_or_none()
    if not pay:
        raise HTTPException(status_code=404, detail={"message": "Payment not found"})

    pay.payment_status = "confirmed"
    pay.verified_by = int(admin["user_id"])
    pay.verified_at = datetime.now(timezone.utc)
    if body.remarks:
        pay.remarks = body.remarks
    session.add(pay)

    order_row = await session.execute(select(Order).where(Order.id == pay.order_id))
    order = order_row.scalar_one_or_none()
    if order:
        order.payment_status = "confirmed"
        order.order_status = "acknowledged"
        session.add(order)

    await session.commit()
    await session.refresh(pay)
    return _fmt(pay)


@router.patch("/admin/payments/{pid}/reject", summary="Reject a payment")
async def reject_payment(pid: str, body: PaymentDecision, admin: Admin, session: Session):
    try:
        i = int(pid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid payment ID"})
    pay_row = await session.execute(select(Payment).where(Payment.id == i))
    pay = pay_row.scalar_one_or_none()
    if not pay:
        raise HTTPException(status_code=404, detail={"message": "Payment not found"})

    pay.payment_status = "rejected"
    pay.verified_by = int(admin["user_id"])
    pay.verified_at = datetime.now(timezone.utc)
    if body.remarks:
        pay.remarks = body.remarks
    session.add(pay)

    order_row = await session.execute(select(Order).where(Order.id == pay.order_id))
    order = order_row.scalar_one_or_none()
    if order:
        order.payment_status = "rejected"
        session.add(order)

    await session.commit()
    await session.refresh(pay)
    return _fmt(pay)
