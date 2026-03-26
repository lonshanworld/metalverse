-- ============================================================
-- 000002: Remove email verification columns from users
-- ============================================================

DROP INDEX IF EXISTS idx_users_email_verification_token;

ALTER TABLE users
    DROP COLUMN IF EXISTS is_email_verified,
    DROP COLUMN IF EXISTS email_verification_token,
    DROP COLUMN IF EXISTS email_verification_expires_at;
