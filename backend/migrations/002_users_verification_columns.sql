-- ============================================================================
-- 002_users_verification_columns.sql
--
-- Re-applies the user-table verification columns that didn't go through in
-- the first migration. Idempotent (IF NOT EXISTS) so safe to re-run.
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified        
 BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token  VARCHAR(128);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token         VARCHAR(128);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS ix_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS ix_users_reset_token        ON users(reset_token);
        