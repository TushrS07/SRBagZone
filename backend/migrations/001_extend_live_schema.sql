    -- ============================================================================
    -- 001_extend_live_schema.sql
    -- One-time migration for the "SR Bagz Zone" Neon database.
    --
    -- Adds the pieces missing from the live schema so the refactored backend
    -- can run against it:
    --   • brands table + brand_id FK on products
    --   • product_images table for multi-image support
    --   • is_verified, verification_token, reset_token, reset_token_expires on users
    --   • TIMESTAMP → TIMESTAMPTZ on every timestamp column (interprets stored
    --     values as UTC; safe because all tables are currently empty)
    --
    -- How to run:
    --   Option A:  Paste into Neon dashboard → SQL Editor → Run
    --   Option B:  psql "$DATABASE_URL" -f migrations/001_extend_live_schema.sql
    --
    -- All statements are idempotent (IF NOT EXISTS / IF EXISTS) — safe to re-run.
    -- ============================================================================

    -- 1) Brands -----------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS brands (
        id          BIGSERIAL PRIMARY KEY,
        name        VARCHAR(120) NOT NULL UNIQUE,
        description TEXT,
        logo_url    TEXT,
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 2) brand_id FK on products ------------------------------------------------
    ALTER TABLE products
        ADD COLUMN IF NOT EXISTS brand_id BIGINT REFERENCES brands(id);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);

    -- 3) product_images (multi-image support) -----------------------------------
    CREATE TABLE IF NOT EXISTS product_images (
        id          BIGSERIAL PRIMARY KEY,
        product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url         TEXT NOT NULL,
        public_id   VARCHAR(255),
        position    INTEGER NOT NULL DEFAULT 0,
        is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

    -- 4) Email verification + password reset on users ---------------------------
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified         BOOLEAN     NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token  VARCHAR(128);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token         VARCHAR(128);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
    CREATE INDEX IF NOT EXISTS ix_users_verification_token ON users(verification_token);
    CREATE INDEX IF NOT EXISTS ix_users_reset_token        ON users(reset_token);

    -- 5) Convert TIMESTAMP → TIMESTAMPTZ (interpret stored values as UTC) -------
    ALTER TABLE users      ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
    ALTER TABLE users      ALTER COLUMN updated_at  TYPE TIMESTAMPTZ USING updated_at  AT TIME ZONE 'UTC';
    ALTER TABLE addresses  ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
    ALTER TABLE products   ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
    ALTER TABLE products   ALTER COLUMN updated_at  TYPE TIMESTAMPTZ USING updated_at  AT TIME ZONE 'UTC';
    ALTER TABLE categories ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
    ALTER TABLE orders     ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
    ALTER TABLE orders     ALTER COLUMN updated_at  TYPE TIMESTAMPTZ USING updated_at  AT TIME ZONE 'UTC';
    ALTER TABLE payments   ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
    ALTER TABLE payments   ALTER COLUMN verified_at TYPE TIMESTAMPTZ USING verified_at AT TIME ZONE 'UTC';
    ALTER TABLE carts      ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'UTC';
