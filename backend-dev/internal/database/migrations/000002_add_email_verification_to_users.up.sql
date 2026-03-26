-- ============================================================
-- 000002: Add email verification columns to users
-- ============================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_email_verified            BOOLEAN     NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_verification_token     TEXT,
    ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_email_verification_token
    ON users(email_verification_token)
    WHERE email_verification_token IS NOT NULL;
