from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from middleware import get_current_user, require_admin, require_verified_customer
from database import get_session
from config import settings
from models.order import Order, OrderItem
from models.product import Product
from models.address import Address
from models.payment import Payment
from models.user import User
from schemas.order import OrderCreate, OrderStatusUpdate
from job_queue import enqueue

router = APIRouter(prefix="/api/orders", tags=["orders"])
admin_router = APIRouter(prefix="/api/admin/orders", tags=["admin-orders"])

Session = Annotated[AsyncSession, Depends(get_session)]
Customer = Annotated[dict, Depends(require_verified_customer)]
Admin = Annotated[dict, Depends(require_admin)]


# ─── Helpers ────────────────────────────────────────────────────────────────
async def _hydrate(session: AsyncSession, o: Order, include_items: bool = True) -> dict:
    address_row = await session.execute(select(Address).where(Address.id == o.address_id))
    addr = address_row.scalar_one_or_none()
    addr_obj = (
        {
            "id": str(addr.id), "full_name": addr.full_name, "phone": addr.phone,
            "address_line1": addr.address_line1, "address_line2": addr.address_line2,
            "city": addr.city, "state": addr.state, "pincode": addr.pincode,
        }
        if addr else None
    )

    items_out: list[dict] = []
    if include_items:
        item_rows = await session.execute(
            select(OrderItem, Product)
            .join(Product, Product.id == OrderItem.product_id)
            .where(OrderItem.order_id == o.id)
        )
        for oi, prod in item_rows.all():
            items_out.append({
                "id": str(oi.id),
                "product_id": str(oi.product_id),
                "product_name": prod.name if prod else "",
                "product_image": prod.image_url if prod else None,
                "quantity": oi.quantity,
                "price": float(oi.price),
                "subtotal": float(oi.subtotal),
            })

    payment_row = await session.execute(select(Payment).where(Payment.order_id == o.id))
    pay = payment_row.scalar_one_or_none()
    pay_obj = (
        {
            "id": str(pay.id), "payment_method": pay.payment_method,
            "upi_reference_number": pay.upi_reference_number,
            "screenshot_url": pay.screenshot_url, "amount": float(pay.amount),
            "payment_status": pay.payment_status,
            "verified_at": pay.verified_at.isoformat() if pay.verified_at else None,
            "remarks": pay.remarks,
            "created_at": pay.created_at.isoformat() if pay.created_at else None,
        }
        if pay else None
    )

    return {
        "id": str(o.id),
        "user_id": str(o.user_id),
        "address": addr_obj,
        "items": items_out,
        "total_amount": float(o.total_amount),
        "order_status": o.order_status,
        "payment_status": o.payment_status,
        "payment": pay_obj,
        "created_at": o.created_at.isoformat() if o.created_at else None,
        "updated_at": o.updated_at.isoformat() if o.updated_at else None,
    }


# ─── Place an order ─────────────────────────────────────────────────────────
@router.post("", status_code=201, summary="Place an order (verified customer only)")
async def place_order(body: OrderCreate, current: Customer, session: Session):
    if not body.items:
        raise HTTPException(status_code=400, detail={"message": "Cart is empty"})

    uid = int(current["user_id"])

    # Address: either reference an existing one OR create one inline
    if body.address_id:
        addr_row = await session.execute(
            select(Address).where(Address.id == body.address_id, Address.user_id == uid)
        )
        address = addr_row.scalar_one_or_none()
        if not address:
            raise HTTPException(status_code=400, detail={"message": "Invalid address"})
    elif body.address:
        address = Address(user_id=uid, **body.address.model_dump())
        session.add(address)
        await session.flush()
    else:
        raise HTTPException(status_code=400, detail={"message": "Address is required"})

    # Validate every product, recompute prices server-side, decrement stock
    pids = [item.product_id for item in body.items]
    prod_rows = await session.execute(
        select(Product).where(Product.id.in_(pids), Product.is_active.is_(True))
    )
    products_by_id = {p.id: p for p in prod_rows.scalars().all()}

    server_items: list[dict] = []
    total = Decimal("0.00")
    for line in body.items:
        product = products_by_id.get(line.product_id)
        if product is None:
            raise HTTPException(status_code=400, detail={"message": f"Product {line.product_id} is unavailable"})
        if line.quantity <= 0:
            raise HTTPException(status_code=400, detail={"message": f"Invalid quantity for {product.name}"})
        if product.stock_quantity < line.quantity:
            raise HTTPException(
                status_code=409,
                detail={"message": f"Only {product.stock_quantity} left of {product.name}; asked for {line.quantity}"},
            )
        subtotal = Decimal(str(product.price)) * line.quantity
        server_items.append({
            "product": product,
            "quantity": line.quantity,
            "price": Decimal(str(product.price)),
            "subtotal": subtotal,
        })
        total += subtotal

    # Insert the order shell
    o = Order(user_id=uid, address_id=address.id, total_amount=total)
    session.add(o)
    await session.flush()  # need o.id for order_items

    for item in server_items:
        session.add(OrderItem(
            order_id=o.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            price=item["price"],
            subtotal=item["subtotal"],
        ))
        item["product"].stock_quantity -= item["quantity"]
        session.add(item["product"])

    await session.commit()
    await session.refresh(o)

    # ── Notifications: confirm to customer + alert admin ──────────────────────
    items_ctx = [
        {
            "name": it["product"].name,
            "quantity": it["quantity"],
            "price": float(it["price"]),
            "subtotal": float(it["subtotal"]),
        }
        for it in server_items
    ]
    await enqueue("order_placed", current["email"], {
        "name": current["name"],
        "order_id": str(o.id),
        "items": items_ctx,
        "total": float(total),
    })
    if settings.admin_email:
        await enqueue("admin_new_order", settings.admin_email, {
            "order_id": str(o.id),
            "customer_name": current["name"],
            "customer_email": current["email"],
            "items": items_ctx,
            "total": float(total),
        })

    return await _hydrate(session, o)


@router.get("/me", summary="List my orders")
async def my_orders(current: Customer, session: Session):
    uid = int(current["user_id"])
    result = await session.execute(
        select(Order).where(Order.user_id == uid).order_by(Order.created_at.desc()).limit(500)
    )
    rows = result.scalars().all()
    return [await _hydrate(session, o) for o in rows]


@router.get("/{oid}", summary="Get one of my orders")
async def get_my_order(oid: str, current: Customer, session: Session):
    try:
        i = int(oid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid order ID"})
    result = await session.execute(select(Order).where(Order.id == i))
    o = result.scalar_one_or_none()
    if not o:
        raise HTTPException(status_code=404, detail={"message": "Order not found"})
    if o.user_id != int(current["user_id"]):
        raise HTTPException(status_code=403, detail={"message": "Not your order"})
    return await _hydrate(session, o)


# ─── Admin ──────────────────────────────────────────────────────────────────
@admin_router.get("", summary="List all orders (admin)")
async def admin_list_orders(admin: Admin, session: Session):
    result = await session.execute(select(Order).order_by(Order.created_at.desc()).limit(500))
    return [await _hydrate(session, o) for o in result.scalars().all()]


@admin_router.patch("/{oid}/status", summary="Update order status")
async def update_order_status(oid: str, body: OrderStatusUpdate, admin: Admin, session: Session):
    try:
        i = int(oid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid order ID"})
    allowed = {"pending", "acknowledged", "completed", "cancelled"}
    if body.order_status not in allowed:
        raise HTTPException(status_code=400, detail={"message": f"Status must be one of {sorted(allowed)}"})
    result = await session.execute(select(Order).where(Order.id == i))
    o = result.scalar_one_or_none()
    if not o:
        raise HTTPException(status_code=404, detail={"message": "Order not found"})
    o.order_status = body.order_status
    o.updated_at = datetime.now(timezone.utc)
    session.add(o)
    await session.commit()
    await session.refresh(o)

    # Notify the customer on terminal status changes
    if body.order_status in ("completed", "cancelled"):
        cust_row = await session.execute(select(User).where(User.id == o.user_id))
        cust = cust_row.scalar_one_or_none()
        if cust:
            event = "order_completed" if body.order_status == "completed" else "order_cancelled"
            await enqueue(event, cust.email, {"name": cust.name, "order_id": str(o.id)})

    return await _hydrate(session, o)


@admin_router.delete("/{oid}", status_code=204, summary="Delete an order")
async def delete_order(oid: str, admin: Admin, session: Session):
    try:
        i = int(oid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid order ID"})
    result = await session.execute(select(Order).where(Order.id == i))
    o = result.scalar_one_or_none()
    if not o:
        raise HTTPException(status_code=404, detail={"message": "Order not found"})
    # Delete child rows first (order_items, payments) — no CASCADE configured
    await session.execute(select(OrderItem).where(OrderItem.order_id == i))
    items_rs = await session.execute(select(OrderItem).where(OrderItem.order_id == i))
    for oi in items_rs.scalars().all():
        await session.delete(oi)
    pay_rs = await session.execute(select(Payment).where(Payment.order_id == i))
    for p in pay_rs.scalars().all():
        await session.delete(p)
    await session.delete(o)
    await session.commit()
