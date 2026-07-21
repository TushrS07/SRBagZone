-- ============================================================================
-- 005_add_mrp_to_products.sql
-- Adds MRP (Maximum Retail Price) column to products table.
-- Existing products get their current price as the default MRP.
--
-- How to run:
--   psql "$DATABASE_URL" -f migrations/005_add_mrp_to_products.sql
-- ============================================================================

-- Add MRP column (nullable initially so we can backfill)
ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp NUMERIC(10, 2);

-- Backfill: set MRP = price for all existing products
UPDATE products SET mrp = price WHERE mrp IS NULL;

-- Now make it NOT NULL
ALTER TABLE products ALTER COLUMN mrp SET NOT NULL;
