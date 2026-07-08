-- ============================================================================
-- 004_otp_codes.sql
--
-- OTP codes for email verification and password reset (replaces the
-- token-link flow). Codes are stored as HMAC hashes, never plaintext.
-- Idempotent — safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS otp_codes (
    id           SERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL,
    purpose      VARCHAR(30)  NOT NULL,        -- 'verify_email' | 'reset_password'
    code_hash    VARCHAR(128) NOT NULL,
    expires_at   TIMESTAMPTZ  NOT NULL,
    attempts     INT          NOT NULL DEFAULT 0,
    max_attempts INT          NOT NULL DEFAULT 5,
    consumed_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_otp_codes_email_purpose ON otp_codes(email, purpose);
