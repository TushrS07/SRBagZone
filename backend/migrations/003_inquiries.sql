-- ============================================================================
-- 003_inquiries.sql
--
-- Customer inquiries submitted via the public contact form.
-- Idempotent — safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS inquiries (
  id           BIGSERIAL PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  phone        VARCHAR(15),
  email        VARCHAR(255),
  requirement  VARCHAR(50)   NOT NULL DEFAULT 'General Inquiry',
  message      TEXT          NOT NULL,
  is_read      BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Allow phone to be NULL (newsletter signups have no phone).
ALTER TABLE inquiries ALTER COLUMN phone DROP NOT NULL;

CREATE INDEX IF NOT EXISTS ix_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS ix_inquiries_is_read    ON inquiries (is_read);
