-- ============================================================
-- 000003: Rename event_media → event_files, add role + sequence
--
-- Handles 3 possible states of the DB:
--   A) Fresh DB (only event_media exists)          → rename + add columns
--   B) GORM AutoMigrate ran (event_files exists)   → just ensure columns exist
--   C) Both tables exist (partial state)           → migrate data + drop old
-- ============================================================

DO $$
BEGIN
    -- ── Case A/C: event_media exists → rename or migrate ──────
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_media') THEN

        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_files') THEN
            -- Case A: only event_media → rename cleanly
            ALTER TABLE event_media RENAME TO event_files;
            ALTER TABLE event_files RENAME COLUMN event_media_id TO event_file_id;
        ELSE
            -- Case C: both exist → copy remaining rows then drop old table
            INSERT INTO event_files (event_file_id, event_id, file_id, sequence, created_at)
            SELECT event_media_id, event_id, file_id, position, created_at
            FROM   event_media
            ON CONFLICT (event_file_id) DO NOTHING;

            DROP TABLE event_media;
        END IF;

    END IF;

    -- ── Ensure role + sequence columns exist (idempotent) ─────
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_files' AND column_name = 'role'
    ) THEN
        ALTER TABLE event_files ADD COLUMN role TEXT NOT NULL DEFAULT 'gallery';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_files' AND column_name = 'sequence'
    ) THEN
        ALTER TABLE event_files ADD COLUMN sequence INT NOT NULL DEFAULT 0;
    END IF;

    -- ── Drop legacy position column if still present ──────────
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'event_files' AND column_name = 'position'
    ) THEN
        -- carry over position value into sequence before dropping
        UPDATE event_files SET sequence = position WHERE position IS NOT NULL;
        ALTER TABLE event_files DROP COLUMN position;
    END IF;

END;
$$;

-- ── Composite index (idempotent) ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_event_files_event_role_seq
    ON event_files(event_id, role, sequence);

DROP INDEX IF EXISTS idx_event_media_event_id;
