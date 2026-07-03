from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text
from config import settings
from database import connect_db, close_db, engine
from cloudinary_config import init_cloudinary
from job_queue import create_redis_pool, close_redis_pool
from rate_limit import limiter
from routers import auth, products, brands, categories, orders, addresses, payments, inquiries
import os
import uvicorn

_start_time = datetime.now(timezone.utc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    init_cloudinary()
    app.state.arq_pool = await create_redis_pool()
    yield
    await close_redis_pool()
    await close_db()


app = FastAPI(
    title="SR Bagz Zone API",
    description=(
        "Backend for the SR Bagz Zone e-commerce platform. Live schema:\n\n"
        "- Single `users` table with `role` (admin/customer)\n"
        "- Normalized `categories`, `brands`, `products` + `product_images`\n"
        "- `orders` + `order_items` + `addresses` + `payments`\n"
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── Rate limiting ─────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(brands.router)
app.include_router(products.router)
app.include_router(products.admin_router)
app.include_router(addresses.router)
app.include_router(orders.router)
app.include_router(orders.admin_router)
app.include_router(payments.router)
app.include_router(inquiries.router)
app.include_router(inquiries.admin_router)


@app.get("/api/health", tags=["health"], summary="Health check")
async def health():
    uptime = (datetime.now(timezone.utc) - _start_time).total_seconds()
    db_status = "ok"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        db_status = "unreachable"
    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "service": "srbagzone-api",
        "version": "2.0.0",
        "database": db_status,
        "uptime_seconds": round(uptime, 2),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# Bearer-in-Swagger
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(title=app.title, version=app.version, description=app.description, routes=app.routes)
    schema.setdefault("components", {})
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    }
    for _, methods in schema.get("paths", {}).items():
        for method, operation in methods.items():
            tags = operation.get("tags", [])
            if "auth" in tags or "health" in tags:
                continue
            if method.lower() in ("post", "put", "delete", "patch"):
                operation.setdefault("security", [{"BearerAuth": []}])
    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = custom_openapi


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
