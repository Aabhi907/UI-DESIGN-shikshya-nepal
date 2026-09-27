-- Restrict public reads of news and scholarships to published/active rows only.
--
-- 20261024_lock_down_database_surface.sql deliberately left the legacy
-- "Public read news" / "Public read scholarships" USING (true) policies in
-- place ("news and scholarships have no stricter policy in the migration
-- history. Keep their legacy SELECT policies until a separate reviewed
-- change supplies one.") — this is that reviewed change.
--
-- news has a status column (draft/published/archived); scholarships has no
-- status column at all — its equivalent flag is the boolean is_active.
BEGIN;

DROP POLICY IF EXISTS "Public read news" ON news;
DO $$ BEGIN
  CREATE POLICY "Public read published news"
    ON news
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Public read scholarships" ON scholarships;
DO $$ BEGIN
  CREATE POLICY "Public read active scholarships"
    ON scholarships
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON POLICY "Public read published news" ON news IS
  'Exposes only published articles to public clients; draft/archived remain admin-only.';
COMMENT ON POLICY "Public read active scholarships" ON scholarships IS
  'Exposes only active scholarships to public clients; inactive/expired remain admin-only.';

COMMIT;

-- Undo (kept here for the PR description, not applied by this file):
--
-- BEGIN;
-- DROP POLICY IF EXISTS "Public read published news" ON news;
-- CREATE POLICY "Public read news" ON news FOR SELECT TO anon USING (true);
-- DROP POLICY IF EXISTS "Public read active scholarships" ON scholarships;
-- CREATE POLICY "Public read scholarships" ON scholarships FOR SELECT TO anon USING (true);
-- COMMIT;
