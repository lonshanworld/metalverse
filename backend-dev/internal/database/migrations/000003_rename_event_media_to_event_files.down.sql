-- ============================================================
-- 000003: Revert event_files → event_media
-- ============================================================

DROP INDEX IF EXISTS idx_event_files_event_role_seq;

ALTER TABLE event_files
    ADD COLUMN IF NOT EXISTS position INT;

UPDATE event_files SET position = sequence;

ALTER TABLE event_files
    DROP COLUMN IF EXISTS role,
    DROP COLUMN IF EXISTS sequence;

ALTER TABLE event_files RENAME COLUMN event_file_id TO event_media_id;
ALTER TABLE event_files RENAME TO event_media;

CREATE INDEX IF NOT EXISTS idx_event_media_event_id ON event_media(event_id);
