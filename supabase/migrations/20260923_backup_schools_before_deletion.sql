-- FOUNDER-RUN, STEP 1 OF 2. Run this in the Supabase SQL Editor before
-- 20260923_delete_schools_feature.sql, and only after confirming this PR
-- (the "Remove Schools + reorganise navigation" Build Brief) is deployed —
-- no application code queries a school table once that PR is live.
--
-- Creates a full snapshot of every school-related table so the data can be
-- restored if needed. These backup tables are private copies with RLS, no
-- indexes and no foreign keys — they exist only as a restore point, not for
-- the application to query. They are never referenced by app code.
--
-- Restoring a single table later, if ever needed:
--   INSERT INTO schools SELECT * FROM schools_backup_20260923;

CREATE TABLE IF NOT EXISTS schools_backup_20260923 AS
  SELECT * FROM schools;
ALTER TABLE schools_backup_20260923 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON schools_backup_20260923 FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS saved_schools_backup_20260923 AS
  SELECT * FROM saved_schools;
ALTER TABLE saved_schools_backup_20260923 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON saved_schools_backup_20260923 FROM anon, authenticated;

-- admissions is NOT a school-only table (colleges/universities use it too),
-- so it is not dropped — but back up the rows that reference a school,
-- since the next migration removes that column.
CREATE TABLE IF NOT EXISTS admissions_school_linked_backup_20260923 AS
  SELECT * FROM admissions WHERE school_id IS NOT NULL;
ALTER TABLE admissions_school_linked_backup_20260923 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON admissions_school_linked_backup_20260923 FROM anon, authenticated;

COMMENT ON TABLE schools_backup_20260923 IS 'Snapshot of schools before the table was dropped on 2026-09-23. Restore point only, not queried by the app.';
COMMENT ON TABLE saved_schools_backup_20260923 IS 'Snapshot of saved_schools before the table was dropped on 2026-09-23. Restore point only, not queried by the app.';
COMMENT ON TABLE admissions_school_linked_backup_20260923 IS 'Snapshot of admissions rows that had a school_id before that column was dropped on 2026-09-23. Restore point only, not queried by the app.';
