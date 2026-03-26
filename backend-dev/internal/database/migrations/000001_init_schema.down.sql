-- ============================================================
-- 000001: Drop Initial Schema (reverse order)
-- ============================================================

DROP TABLE IF EXISTS credentials              CASCADE;
DROP TABLE IF EXISTS medal_verse_codes        CASCADE;
DROP TABLE IF EXISTS event_views              CASCADE;
DROP TABLE IF EXISTS event_registrations      CASCADE;
DROP TABLE IF EXISTS event_ticket_types       CASCADE;
DROP TABLE IF EXISTS event_bookmarks          CASCADE;
DROP TABLE IF EXISTS event_speakers           CASCADE;
DROP TABLE IF EXISTS speakers                 CASCADE;
DROP TABLE IF EXISTS event_agenda_items       CASCADE;
DROP TABLE IF EXISTS event_outcomes           CASCADE;
DROP TABLE IF EXISTS outcomes                 CASCADE;
DROP TABLE IF EXISTS event_eligibilities      CASCADE;
DROP TABLE IF EXISTS event_tags               CASCADE;
DROP TABLE IF EXISTS tags                     CASCADE;
DROP TABLE IF EXISTS event_media              CASCADE;
DROP TABLE IF EXISTS events                   CASCADE;
DROP TABLE IF EXISTS eligibility_groups       CASCADE;
DROP TABLE IF EXISTS competition_levels       CASCADE;
DROP TABLE IF EXISTS participation_modes      CASCADE;
DROP TABLE IF EXISTS fields                   CASCADE;
DROP TABLE IF EXISTS event_types              CASCADE;
DROP TABLE IF EXISTS locations                CASCADE;
DROP TABLE IF EXISTS organization_members     CASCADE;
DROP TABLE IF EXISTS organizations            CASCADE;
DROP TABLE IF EXISTS files                    CASCADE;
DROP TABLE IF EXISTS users                    CASCADE;
