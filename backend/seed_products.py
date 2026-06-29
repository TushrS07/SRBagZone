"""
Seed categories, the SR brand, and the 12 demo bag products into the live DB.
Uses external Unsplash image URLs (no Cloudinary upload needed).

    python seed_products.py
"""
import asyncio
from decimal import Decimal
from sqlmodel import select
from database import async_session_factory, connect_db, close_db
from models.category import Category
from models.brand import Brand
from models.product import Product, ProductImage


CATEGORIES = ["Handbags", "Backpacks", "School Bags", "Laptop Bags", "Travel"]

PRODUCTS = [
    ("Aspen Leather Tote",      "Handbags",    3999,  20, "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80"),
    ("Trailhead 30L Backpack",  "Backpacks",   2499,  35, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"),
    ("Junior Pack Pro",         "School Bags",  999, 100, "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=800&q=80"),
    ("Meridian Laptop Brief",   "Laptop Bags", 2999,  15, "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80"),
    ("Voyage Weekend Duffel",   "Travel",      3499,  12, "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"),
    ("Lila Crossbody Mini",     "Handbags",    1799,  40, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"),
    ("Campus Classic Backpack", "School Bags", 1299,  80, "https://images.unsplash.com/photo-1564422170194-896b89110ef8?auto=format&fit=crop&w=800&q=80"),
    ("Atlas Carryall Backpack", "Backpacks",   2799,  25, "https://images.unsplash.com/photo-1622560480654-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"),
    ("Noir Quilted Shoulder",   "Handbags",    4499,  18, "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80"),
    ("Globe Trotter Roller",    "Travel",      6999,   8, "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=800&q=80"),
    ("Slate Tech Brief",        "Laptop Bags", 3499,  20, "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=800&q=80"),
    ("Stella Top Handle",       "Handbags",    4199,  22, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"),
]


async def seed() -> None:
    await connect_db()
    try:
        async with async_session_factory() as session:
            # 1) Categories
            cat_lookup = {}
            for name in CATEGORIES:
                row = await session.execute(select(Category).where(Category.name == name))
                c = row.scalar_one_or_none()
                if c is None:
                    c = Category(name=name)
                    session.add(c)
                    await session.flush()
                cat_lookup[name] = c.id

            # 2) Brand "SR"
            brand_row = await session.execute(select(Brand).where(Brand.name == "SR"))
            sr = brand_row.scalar_one_or_none()
            if sr is None:
                sr = Brand(name="SR", description="SR Bagz Zone in-house brand", is_active=True)
                session.add(sr)
                await session.flush()
            brand_id = sr.id

            # 3) Products + primary image
            existing_count = (await session.execute(select(Product))).scalars().all()
            if existing_count:
                print(f"[seed] {len(existing_count)} products already exist — skipping products.")
            else:
                for name, cat, price, stock, url in PRODUCTS:
                    p = Product(
                        name=name,
                        description=None,
                        price=Decimal(str(price)),
                        stock_quantity=stock,
                        category_id=cat_lookup[cat],
                        brand_id=brand_id,
                        image_url=url,
                        is_active=True,
                    )
                    session.add(p)
                    await session.flush()
                    session.add(ProductImage(
                        product_id=p.id, url=url,
                        public_id=f"unsplash-{name.lower().replace(' ', '-')}",
                        position=0, is_primary=True,
                    ))
                print(f"[seed] Inserted {len(PRODUCTS)} products.")

            await session.commit()
            print("[seed] Done. Categories + brand + products seeded.")
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(seed())
