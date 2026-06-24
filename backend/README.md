# SR Bag Zone — Backend

FastAPI + PostgreSQL (SQLModel) + Cloudinary + JWT.

## Setup

```bash
# 1. Create venv and install
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. Configure env
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, CLOUDINARY_* values

# 3. Create the database in Postgres
createdb srbagzone

# 4. Run the server (tables auto-create on startup)
python run.py
# or: uvicorn main:app --reload

# 5. Seed an admin user
python seed_admin.py admin@srbagzone.com yourpassword
```

Open **http://localhost:8000/api/docs** for Swagger.

## Endpoints

### Auth
- `POST /api/auth/login` and `POST /api/admin/login` — returns JWT (24h)
- `POST /api/auth/refresh` — refresh token (Bearer)

### Products
- `GET  /api/get-products` (filters: category, brand, bestseller; pagination)
- `GET  /api/get-product/{id}`
- `GET  /api/admin/get-products` 🔒
- `POST /api/admin/add-product` (multipart) 🔒
- `PUT  /api/update-product/{id}` (multipart) 🔒
- `PATCH /api/admin/toggle-product/{id}` 🔒
- `DELETE /api/delete-product/{id}` 🔒

### Brands
- `POST /api/brands` 🔒, `GET /api/brands`, `GET /api/brands/{id}`,
  `PUT /api/brands/{id}` 🔒, `DELETE /api/brands/{id}` 🔒

### Categories
- Same shape as brands under `/api/categories`.

### Orders
- `POST /api/place-order` (public)
- `GET  /api/order/{id}` (public)
- `POST /api/order/{id}/payment-screenshot` (public)
- `GET  /api/admin/orders` 🔒
- `PATCH /api/admin/confirm-payment/{id}` 🔒
- `PATCH /api/admin/reject-payment/{id}` 🔒
- `PATCH /api/admin/toggle-order/{id}` 🔒
- `PATCH /api/admin/update-order-status/{id}` 🔒
- `DELETE /api/admin/delete-order/{id}` 🔒

### Contact / inquiries
- `POST /api/add-inquiry` (public)
- `GET  /api/get-inquiries` 🔒
- `PATCH /api/toggle-inquiry/{id}` 🔒
- `DELETE /api/delete-inquiry/{id}` 🔒

### Health
- `GET /api/health`

## Notes
- Tables are created on startup via `SQLModel.metadata.create_all`. For
  production schema changes, switch to Alembic migrations.
- Images go to Cloudinary; `media` and `items` are stored as JSONB arrays.
