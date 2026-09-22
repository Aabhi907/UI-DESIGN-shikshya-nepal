-- University-specific programme facts.
-- A catalogue programme such as BCA can differ by awarding university. Keep
-- duration, eligibility and entrance requirements here instead of treating a
-- single generic programme row as authoritative for every institution.

CREATE TABLE IF NOT EXISTS university_program_offerings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  display_name TEXT,
  duration TEXT NOT NULL,
  eligibility TEXT,
  entrance_requirements TEXT,
  overview TEXT,
  curriculum_highlights TEXT[] NOT NULL DEFAULT '{}',
  official_program_url TEXT NOT NULL CHECK (official_program_url ~ '^https://'),
  source_name TEXT NOT NULL,
  source_published_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, university_id)
);

ALTER TABLE college_programs
  ADD COLUMN IF NOT EXISTS university_program_offering_id UUID
  REFERENCES university_program_offerings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_university_program_offerings_public
  ON university_program_offerings(program_id, status, university_id);

CREATE INDEX IF NOT EXISTS idx_college_programs_offering
  ON college_programs(university_program_offering_id)
  WHERE university_program_offering_id IS NOT NULL;

ALTER TABLE university_program_offerings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published university programme offerings"
  ON university_program_offerings;
CREATE POLICY "Public read published university programme offerings"
  ON university_program_offerings
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Signed-in students use the authenticated database role. Keep the awarding
-- university label visible to them as well as anonymous visitors.
DO $$ BEGIN
  CREATE POLICY "Authenticated read universities"
    ON universities
    FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE university_program_offerings IS
  'Source-backed programme facts belonging to one awarding university.';
COMMENT ON COLUMN college_programs.university_program_offering_id IS
  'Exact awarding-university programme variant offered by this college.';
