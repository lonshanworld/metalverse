-- ============================================================
-- 000001: Initial Schema
-- Safe to run on both fresh DB and existing GORM-migrated DB.
-- FK constraints use DO/EXCEPTION so they skip if already exist
-- or if the referenced table has no unique constraint (GORM dev mode).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Core ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    user_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email          VARCHAR NOT NULL UNIQUE,
    username       VARCHAR UNIQUE,
    password       VARCHAR,
    first_name     VARCHAR,
    last_name      VARCHAR,
    avatar_file_id UUID,
    is_active      BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS files (
    file_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID,
    file_name     VARCHAR NOT NULL,
    file_size     BIGINT,
    mime_type     VARCHAR,
    storage_key   VARCHAR NOT NULL,
    url           VARCHAR,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);

-- FK: files.owner_user_id → users.user_id
DO $$ BEGIN
    ALTER TABLE files ADD CONSTRAINT fk_files_owner_user
        FOREIGN KEY (owner_user_id) REFERENCES users(user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
          WHEN undefined_table  THEN NULL;
          WHEN SQLSTATE '42830'  THEN NULL; -- no unique constraint
END; $$;

-- FK: users.avatar_file_id → files.file_id
DO $$ BEGIN
    ALTER TABLE users ADD CONSTRAINT fk_users_avatar_file
        FOREIGN KEY (avatar_file_id) REFERENCES files(file_id);
EXCEPTION WHEN duplicate_object THEN NULL;
          WHEN undefined_table  THEN NULL;
          WHEN SQLSTATE '42830'  THEN NULL; -- no unique constraint
END; $$;

CREATE TABLE IF NOT EXISTS organizations (
    org_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    abbreviation TEXT,
    name         TEXT NOT NULL,
    description  TEXT,
    logo_file_id UUID,
    website      TEXT,
    is_active    BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMPTZ
);

DO $$ BEGIN
    ALTER TABLE organizations ADD CONSTRAINT fk_orgs_logo_file
        FOREIGN KEY (logo_file_id) REFERENCES files(file_id);
EXCEPTION WHEN duplicate_object THEN NULL;
          WHEN SQLSTATE '42830'  THEN NULL;
END; $$;

CREATE TABLE IF NOT EXISTS organization_members (
    org_member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id        UUID NOT NULL,
    user_id       UUID NOT NULL,
    role          TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
    ALTER TABLE organization_members ADD CONSTRAINT fk_org_members_org
        FOREIGN KEY (org_id) REFERENCES organizations(org_id);
EXCEPTION WHEN duplicate_object THEN NULL;
          WHEN SQLSTATE '42830'  THEN NULL;
END; $$;

DO $$ BEGIN
    ALTER TABLE organization_members ADD CONSTRAINT fk_org_members_user
        FOREIGN KEY (user_id) REFERENCES users(user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
          WHEN SQLSTATE '42830'  THEN NULL;
END; $$;

CREATE TABLE IF NOT EXISTS organization_onboarding_submissions (
    submission_id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by_user_id          UUID,
    org_name                    TEXT        NOT NULL,
    abbreviation                TEXT,
    org_type                    TEXT,
    custom_org_type             TEXT,
    country                     TEXT,
    city                        TEXT,
    website                     TEXT,
    social_media                TEXT,
    other_urls                  TEXT,
    official_email              TEXT,
    official_country_code       TEXT,
    official_phone_number       TEXT,
    representative_name         TEXT,
    representative_role         TEXT,
    representative_email        TEXT,
    representative_country_code TEXT,
    representative_phone_number TEXT,
    agreed_to_terms             BOOLEAN     NOT NULL DEFAULT false,
    subscribed_to_updates       BOOLEAN     NOT NULL DEFAULT false,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at                  TIMESTAMPTZ
);

-- กรณี table มีอยู่แล้วจาก GORM AutoMigrate แต่ยังไม่มี created_by_user_id
ALTER TABLE organization_onboarding_submissions
    ADD COLUMN IF NOT EXISTS created_by_user_id UUID;

DO $$ BEGIN
    ALTER TABLE organization_onboarding_submissions ADD CONSTRAINT fk_org_onboarding_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users(user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
          WHEN SQLSTATE '42830'  THEN NULL;
END; $$;

CREATE TABLE IF NOT EXISTS locations (
    location_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT,
    address1    TEXT,
    address2    TEXT,
    district    TEXT,
    province    TEXT,
    postal_code TEXT,
    country     TEXT,
    latitude    NUMERIC,
    longitude   NUMERIC,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Master Data ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_types (
    event_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code          TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS fields (
    field_id  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code      TEXT NOT NULL UNIQUE,
    name      TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS participation_modes (
    participation_mode_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                  TEXT NOT NULL UNIQUE,
    name                  TEXT NOT NULL,
    is_active             BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS competition_levels (
    competition_level_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                 TEXT NOT NULL UNIQUE,
    name                 TEXT NOT NULL,
    is_active            BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS eligibility_groups (
    eligibility_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code           TEXT NOT NULL UNIQUE,
    name           TEXT NOT NULL,
    is_active      BOOLEAN NOT NULL DEFAULT true
);

-- ── Events ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
    event_id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id                UUID NOT NULL,
    location_id           UUID,
    name                  TEXT NOT NULL,
    short_description     TEXT,
    description           TEXT,
    event_type_id         UUID,
    field_id              UUID,
    participation_mode_id UUID,
    competition_level_id  UUID,
    start_at              TIMESTAMPTZ NOT NULL,
    end_at                TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ,
    capacity              INT,
    remaining_seats       INT,
    cover_file_id         UUID,
    is_sponsored          BOOLEAN NOT NULL DEFAULT false,
    status                TEXT,
    created_by            UUID,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at            TIMESTAMPTZ
);

DO $$ BEGIN
    ALTER TABLE events ADD CONSTRAINT fk_events_org
        FOREIGN KEY (org_id) REFERENCES organizations(org_id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN SQLSTATE '42830' THEN NULL; END; $$;

DO $$ BEGIN
    ALTER TABLE events ADD CONSTRAINT fk_events_cover_file
        FOREIGN KEY (cover_file_id) REFERENCES files(file_id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN SQLSTATE '42830' THEN NULL; END; $$;

CREATE TABLE IF NOT EXISTS event_media (
    event_media_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id       UUID NOT NULL,
    file_id        UUID NOT NULL,
    position       INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
    ALTER TABLE event_media ADD CONSTRAINT fk_event_media_event
        FOREIGN KEY (event_id) REFERENCES events(event_id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN SQLSTATE '42830' THEN NULL; END; $$;

DO $$ BEGIN
    ALTER TABLE event_media ADD CONSTRAINT fk_event_media_file
        FOREIGN KEY (file_id) REFERENCES files(file_id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN SQLSTATE '42830' THEN NULL; END; $$;

CREATE TABLE IF NOT EXISTS tags (
    tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name   TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS event_tags (
    event_id UUID NOT NULL,
    tag_id   UUID NOT NULL,
    PRIMARY KEY (event_id, tag_id)
);

CREATE TABLE IF NOT EXISTS event_eligibilities (
    event_id       UUID NOT NULL,
    eligibility_id UUID NOT NULL,
    PRIMARY KEY (event_id, eligibility_id)
);

CREATE TABLE IF NOT EXISTS outcomes (
    outcome_id  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS event_outcomes (
    event_id   UUID NOT NULL,
    outcome_id UUID NOT NULL,
    position   INT,
    PRIMARY KEY (event_id, outcome_id)
);

CREATE TABLE IF NOT EXISTS event_agenda_items (
    agenda_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id       UUID NOT NULL,
    start_at       TIMESTAMPTZ,
    end_at         TIMESTAMPTZ,
    title          TEXT NOT NULL,
    description    TEXT,
    position       INT
);

CREATE TABLE IF NOT EXISTS speakers (
    speaker_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_name   TEXT NOT NULL,
    title          TEXT,
    bio            TEXT,
    avatar_file_id UUID,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
    ALTER TABLE speakers ADD CONSTRAINT fk_speakers_avatar
        FOREIGN KEY (avatar_file_id) REFERENCES files(file_id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN SQLSTATE '42830' THEN NULL; END; $$;

CREATE TABLE IF NOT EXISTS event_speakers (
    event_id   UUID NOT NULL,
    speaker_id UUID NOT NULL,
    role       TEXT,
    position   INT,
    PRIMARY KEY (event_id, speaker_id)
);

-- ── User Actions ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_bookmarks (
    user_id    UUID NOT NULL,
    event_id   UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS event_ticket_types (
    ticket_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id       UUID NOT NULL,
    name           TEXT NOT NULL,
    price          NUMERIC(18,2) NOT NULL DEFAULT 0,
    currency       TEXT NOT NULL DEFAULT 'THB',
    capacity       INT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_registrations (
    registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id        UUID NOT NULL,
    user_id         UUID NOT NULL,
    ticket_type_id  UUID,
    status          TEXT,
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    cancelled_at    TIMESTAMPTZ,
    attended_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS event_views (
    view_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id   UUID,
    event_id  UUID NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Credentials ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medal_verse_codes (
    code_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code       TEXT NOT NULL UNIQUE,
    event_id   UUID NOT NULL,
    max_uses   INT,
    used_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS credentials (
    credential_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id        UUID NOT NULL,
    user_id         UUID NOT NULL,
    registration_id UUID,
    name            TEXT,
    type            TEXT,
    recipient_name  TEXT,
    field_id        UUID,
    rank            TEXT,
    issue_date      TIMESTAMPTZ,
    key_learning    TEXT,
    is_private      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_deleted_at                              ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_deleted_at                             ON events(deleted_at);
CREATE INDEX IF NOT EXISTS idx_events_org_id                                 ON events(org_id);
CREATE INDEX IF NOT EXISTS idx_events_start_at                               ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_event_media_event_id                          ON event_media(event_id);
CREATE INDEX IF NOT EXISTS idx_credentials_deleted_at                        ON credentials(deleted_at);
CREATE INDEX IF NOT EXISTS idx_medal_verse_codes_deleted_at                  ON medal_verse_codes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_org_onboarding_submissions_created_by_user_id ON organization_onboarding_submissions(created_by_user_id) WHERE created_by_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_org_onboarding_submissions_deleted_at         ON organization_onboarding_submissions(deleted_at);
