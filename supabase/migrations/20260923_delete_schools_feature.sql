-- FOUNDER-RUN, STEP 2 OF 2. Do NOT run this from application code or CI —
-- run it manually in the Supabase SQL Editor, and only after:
--   1. 20260923_backup_schools_before_deletion.sql has been run, and
--   2. the "Remove Schools + reorganise navigation" PR is deployed to
--      production, so no running code queries a school table.
--
-- Drops every school-only table, function and column found in the schema.
-- Tables that are SHARED between schools and colleges (data_corrections,
-- institution_claims, institution_memberships) are intentionally left
-- alone — see the notes at the bottom of this file.

-- Distance-search RPC used only by the deleted /api/schools/nearby route.
DROP FUNCTION IF EXISTS nearby_active_schools(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER);

-- admissions is shared with colleges/universities, so only the school-only
-- column (and the constraint/index that reference it) are removed, not the
-- table itself. Existing rows keep institution_type='school' and
-- institution_name as free text; only the FK pointer is gone. Dropping the
-- column automatically drops its own index (idx_admissions_school) and the
-- CHECK (school_id IS NULL OR college_id IS NULL) constraint, since both
-- reference only this column.
ALTER TABLE admissions DROP COLUMN IF EXISTS school_id;

-- Saved-schools shortlist — school-only table, FK-dependent on schools.
DROP TABLE IF EXISTS saved_schools;

-- The core school directory table itself. Its indexes
-- (idx_schools_slug, idx_schools_location, idx_schools_type,
-- idx_schools_verified, idx_schools_name_search, idx_schools_name_trigram,
-- idx_schools_active_directory_order, idx_schools_active_geography) and its
-- RLS policy ("Public read active schools") are dropped automatically with
-- the table — no separate DROP INDEX/POLICY statements are needed.
DROP TABLE IF EXISTS schools;

-- Not dropped, and why:
--
-- data_corrections: entity_type CHECK allows ('school', 'college'); rows
-- with entity_type='school' become historical records whose entity_id no
-- longer resolves to anything (there was never a foreign key on entity_id,
-- so dropping `schools` above does not fail or cascade into this table).
-- Leaving them is a deliberate choice — they are still valid audit history
-- of a correction someone reported; delete them by hand only if you want a
-- fully clean table:
--   DELETE FROM data_corrections WHERE entity_type = 'school';
--
-- institution_claims / institution_memberships: entity_type is a free-text
-- column with no CHECK constraint and no foreign key on entity_id, so nothing
-- breaks. Any existing entity_type='school' rows will simply stop resolving
-- to a real institution in the UI (the app already handles a missing
-- institution gracefully, showing "Institution unavailable"). Purge by hand
-- if wanted:
--   DELETE FROM institution_claims WHERE entity_type = 'school';
--   DELETE FROM institution_memberships WHERE entity_type = 'school';
--
-- pg_trgm extension: added for the schools directory's trigram search index,
-- but this is a shared Postgres extension — do not drop it without first
-- confirming nothing else in the schema depends on it.
