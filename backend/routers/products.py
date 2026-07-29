import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from middleware import require_admin
from database import get_session
from models.product import Product, ProductImage
from models.category import Category
from models.brand import Brand
from utils.media import upload_files, delete_asset

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/products", tags=["products"])
admin_router = APIRouter(prefix="/api/admin/products", tags=["admin-products"])

Session = Annotated[AsyncSession, Depends(get_session)]
Admin = Annotated[dict, Depends(require_admin)]


# ─── Helpers ────────────────────────────────────────────────────────────────
def _fmt_product(p: Product, cat_name: Optional[str], brand_name: Optional[str], images: list) -> dict:
    return {
        "id": str(p.id),
        "name": p.name,
        "description": p.description,
        "mrp": float(p.mrp),
        "price": float(p.price),
        "stock_quantity": p.stock_quantity,
        "is_active": p.is_active,
        "category_id": str(p.category_id) if p.category_id else None,
        "category_name": cat_name,
        "brand_id": str(p.brand_id) if p.brand_id else None,
        "brand_name": brand_name,
        "image_url": p.image_url,
        "images": [
            {"id": str(i.id), "url": i.url, "public_id": i.public_id,
             "is_primary": i.is_primary, "position": i.position}
            for i in images
        ],
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


async def _batch_hydrate(session: AsyncSession, stmt) -> list[dict]:
    """
    Run a SELECT for products and return hydrated dicts using exactly 2 queries
    total (1 for products+category+brand JOIN, 1 for product_images IN(...)).
    Replaces the previous N+1 pattern.

    `stmt` should be a SELECT against Product (filters / order / limit applied).
    """
    # 1) Wrap the caller's products SELECT with LEFT JOINs to bring in
    #    category name + brand name in a single round-trip.
    base = stmt.add_columns(
        Category.name.label("category_name"),
        Brand.name.label("brand_name"),
    ).outerjoin(Category, Category.id == Product.category_id) \
     .outerjoin(Brand, Brand.id == Product.brand_id)

    result = await session.execute(base)
    rows = result.all()
    if not rows:
        return []

    products = [r[0] for r in rows]
    product_ids = [p.id for p in products]

    # 2) Batch-fetch all images for those products
    img_stmt = (
        select(ProductImage)
        .where(ProductImage.product_id.in_(product_ids))
        .order_by(ProductImage.position.asc(), ProductImage.id.asc())
    )
    img_rows = (await session.execute(img_stmt)).scalars().all()
    images_by_pid: dict[int, list] = {}
    for img in img_rows:
        images_by_pid.setdefault(img.product_id, []).append(img)

    return [
        _fmt_product(p, row.category_name, row.brand_name, images_by_pid.get(p.id, []))
        for p, row in [(r[0], r) for r in rows]
    ]


async def _hydrate_one(session: AsyncSession, p: Product) -> dict:
    """Single-product hydrate used by the detail endpoint (3 queries total)."""
    cat_name = brand_name = None
    if p.category_id:
        cat_row = await session.execute(select(Category).where(Category.id == p.category_id))
        c = cat_row.scalar_one_or_none()
        cat_name = c.name if c else None
    if p.brand_id:
        brand_row = await session.execute(select(Brand).where(Brand.id == p.brand_id))
        b = brand_row.scalar_one_or_none()
        brand_name = b.name if b else None
    img_rows = await session.execute(
        select(ProductImage)
        .where(ProductImage.product_id == p.id)
        .order_by(ProductImage.position.asc(), ProductImage.id.asc())
    )
    return _fmt_product(p, cat_name, brand_name, img_rows.scalars().all())


def _parse_optional_int(v: Optional[str]) -> Optional[int]:
    if v is None or v == "":
        return None
    return int(v)


def _parse_bool(v: Optional[str]) -> Optional[bool]:
    if v is None:
        return None
    return v.lower() in ("true", "1", "yes")


async def _get_or_404(session: AsyncSession, pid: str) -> Product:
    try:
        i = int(pid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid product ID"})
    result = await session.execute(select(Product).where(Product.id == i))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail={"message": "Product not found"})
    return p


# ─── Public ─────────────────────────────────────────────────────────────────
@router.get("", summary="List active products")
async def list_products(
    session: Session,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 500,
):
    stmt = select(Product).where(Product.is_active.is_(True))
    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)
    if brand_id is not None:
        stmt = stmt.where(Product.brand_id == brand_id)
    stmt = stmt.order_by(Product.created_at.desc()).offset(skip).limit(limit)
    return await _batch_hydrate(session, stmt)


@router.get("/{pid}", summary="Get a single product (active only)")
async def get_product(pid: str, session: Session):
    p = await _get_or_404(session, pid)
    if not p.is_active:
        raise HTTPException(status_code=404, detail={"message": "Product not found"})
    return await _hydrate_one(session, p)


# ─── Admin ──────────────────────────────────────────────────────────────────
@admin_router.get("", summary="List all products including inactive")
async def admin_list_products(admin: Admin, session: Session, skip: int = 0, limit: int = 1000):
    stmt = select(Product).order_by(Product.created_at.desc()).offset(skip).limit(limit)
    return await _batch_hydrate(session, stmt)


@admin_router.post("", status_code=201, summary="Create a product")
async def create_product(
    admin: Admin,
    session: Session,
    name: str = Form(...),
    mrp: float = Form(...),
    price: float = Form(...),
    stock_quantity: int = Form(0),
    description: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    brand_id: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
):
    p = Product(
        name=name,
        description=description,
        mrp=Decimal(str(mrp)),
        price=Decimal(str(price)),
        stock_quantity=stock_quantity,
        category_id=_parse_optional_int(category_id),
        brand_id=_parse_optional_int(brand_id),
    )
    session.add(p)
    await session.flush()  # need p.id for product_images

    valid_images = [f for f in images if f.filename and f.size and f.size > 0]
    if valid_images:
        try:
            assets = await upload_files(valid_images, folder="srbagzone/products")
            for idx, a in enumerate(assets):
                pi = ProductImage(
                    product_id=p.id,
                    url=a.url,
                    public_id=a.public_id,
                    position=idx,
                    is_primary=(idx == 0),
                )
                session.add(pi)
                if idx == 0:
                    p.image_url = a.url
            session.add(p)
        except Exception as e:
            logger.error("[products] image upload failed: %s", e)
            # Do NOT call session.rollback() here — the get_session dependency
            # already rolls back on any unhandled exception. Calling it a second
            # time corrupts the session state under PgBouncer/Neon pooler and
            # can cause previously-committed products to appear deleted.
            raise HTTPException(status_code=400, detail={"message": f"Image upload failed: {e}"})

    await session.commit()
    await session.refresh(p)
    return await _hydrate_one(session, p)


@admin_router.put("/{pid}", summary="Update a product")
async def update_product(
    pid: str,
    admin: Admin,
    session: Session,
    name: Optional[str] = Form(None),
    mrp: Optional[float] = Form(None),
    price: Optional[float] = Form(None),
    stock_quantity: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    brand_id: Optional[str] = Form(None),
    is_active: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
):
    p = await _get_or_404(session, pid)

    if name is not None: p.name = name
    if mrp is not None: p.mrp = Decimal(str(mrp))
    if price is not None: p.price = Decimal(str(price))
    if stock_quantity is not None and stock_quantity != "": p.stock_quantity = int(stock_quantity)
    if description is not None: p.description = description
    if category_id is not None: p.category_id = _parse_optional_int(category_id)
    if brand_id is not None: p.brand_id = _parse_optional_int(brand_id)
    if is_active is not None: p.is_active = _parse_bool(is_active) or False
    p.updated_at = datetime.now(timezone.utc)

    valid_images = [f for f in images if f.filename and f.size and f.size > 0]
    if valid_images:
        # Find existing image count for position offset
        existing = await session.execute(select(ProductImage).where(ProductImage.product_id == p.id))
        existing_count = len(existing.scalars().all())
        assets = await upload_files(valid_images, folder="srbagzone/products")
        for idx, a in enumerate(assets):
            pi = ProductImage(
                product_id=p.id,
                url=a.url,
                public_id=a.public_id,
                position=existing_count + idx,
                is_primary=(existing_count + idx == 0),
            )
            session.add(pi)
            if existing_count == 0 and idx == 0:
                p.image_url = a.url

    session.add(p)
    await session.commit()
    await session.refresh(p)
    return await _hydrate_one(session, p)


@admin_router.patch("/{pid}/toggle", summary="Toggle product active status")
async def toggle_product(pid: str, admin: Admin, session: Session):
    p = await _get_or_404(session, pid)
    p.is_active = not p.is_active
    p.updated_at = datetime.now(timezone.utc)
    session.add(p)
    await session.commit()
    await session.refresh(p)
    return await _hydrate_one(session, p)


@admin_router.delete("/{pid}", status_code=204, summary="Delete a product")
async def delete_product(pid: str, admin: Admin, session: Session):
    p = await _get_or_404(session, pid)
    # Best-effort Cloudinary cleanup
    img_rows = await session.execute(select(ProductImage).where(ProductImage.product_id == p.id))
    for img in img_rows.scalars().all():
        if img.public_id:
            try:
                await delete_asset(img.public_id)
            except Exception as e:
                logger.warning("[products] cloudinary cleanup failed: %s", e)
    await session.delete(p)  # CASCADE on product_images will clean DB rows
    await session.commit()


@admin_router.delete("/{pid}/images/{image_id}", status_code=204, summary="Delete one image of a product")
async def delete_product_image(pid: str, image_id: str, admin: Admin, session: Session):
    try:
        pi_id = int(image_id)
        prod_id = int(pid)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail={"message": "Invalid ID"})
    result = await session.execute(
        select(ProductImage).where(ProductImage.id == pi_id, ProductImage.product_id == prod_id)
    )
    img = result.scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=404, detail={"message": "Image not found"})
    if img.public_id:
        try:
            await delete_asset(img.public_id)
        except Exception:
            pass
    await session.delete(img)
    await session.commit()
