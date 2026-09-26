-- Founder-run after 20261023; no application data is changed.
BEGIN;

ALTER TABLE public.public_form_attempts
  DROP CONSTRAINT IF EXISTS public_form_attempts_action_check;
ALTER TABLE public.public_form_attempts
  ADD CONSTRAINT public_form_attempts_action_check
  CHECK (action IN ('subscribe', 'correction', 'college_submission', 'school_submission', 'account_registration', 'admission_enquiry', 'safety_report'));

CREATE OR REPLACE FUNCTION public.consume_public_form_rate_limit(
  p_action TEXT, p_fingerprint_hash TEXT, p_limit INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE attempt_count INTEGER;
BEGIN
  -- school_submission is retained in the constraint for historical rows only.
  IF p_limit IS NULL OR p_limit < 1 OR p_action IS NULL OR p_action NOT IN ('subscribe', 'correction', 'college_submission', 'account_registration', 'admission_enquiry', 'safety_report') THEN
    RAISE EXCEPTION 'Invalid rate limit action';
  END IF;
  DELETE FROM public_form_attempts WHERE expires_at < NOW();
  INSERT INTO public_form_attempts (action, fingerprint_hash) VALUES (p_action, p_fingerprint_hash);
  SELECT COUNT(*) INTO attempt_count FROM public_form_attempts
  WHERE action = p_action AND fingerprint_hash = p_fingerprint_hash
    AND created_at >= NOW() - INTERVAL '1 hour';
  RETURN attempt_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.cast_community_vote(TEXT, UUID, TEXT, SMALLINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cast_community_vote(TEXT, UUID, TEXT, SMALLINT) TO service_role;
REVOKE ALL ON FUNCTION public.consume_public_form_rate_limit(TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_public_form_rate_limit(TEXT, TEXT, INTEGER) TO service_role;
REVOKE ALL ON FUNCTION public.delete_expired_community_security_events() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_expired_community_security_events() TO service_role;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
-- Schema defaults are additive; the global default must also be revoked.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

-- Application table writes and RPCs use the service-role client.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Anyone can report corrections" ON public.data_corrections;
DROP POLICY IF EXISTS "Anyone can report a safety or privacy concern" ON public.safety_privacy_reports;
DROP POLICY IF EXISTS "Users submit own claims" ON public.institution_claims;
DROP POLICY IF EXISTS "Users save colleges" ON public.saved_colleges;
DROP POLICY IF EXISTS "Users remove saved colleges" ON public.saved_colleges;
DROP POLICY IF EXISTS "Users manage own student path profile" ON public.student_path_profiles;
DROP POLICY IF EXISTS "Users manage own student path tasks" ON public.student_path_tasks;
DROP POLICY IF EXISTS "Users manage own admission plans" ON public.student_admission_plans;
DO $$ BEGIN
  IF to_regclass('public.saved_schools') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users manage own saved schools" ON public.saved_schools;
  END IF;
END $$;

-- These records are read through server-side authorization, not public clients.
-- profiles keeps authenticated SELECT for middleware and admin sign-in.
-- student_opportunities is a published public catalogue, not private plan state.
DO $$
DECLARE item RECORD; columns TEXT; roles TEXT;
BEGIN
  FOR item IN
    SELECT c.oid, c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
      AND (c.relname IN ('leads', 'subscribers', 'audit_logs', 'content_ingestion_items',
        'content_sources', 'community_reports', 'community_security_events',
        'community_votes', 'community_profiles', 'review_verifications',
        'search_events', 'public_form_attempts', 'notification_delivery_runs',
        'institution_claims', 'institution_memberships', 'saved_colleges',
        'saved_schools', 'data_corrections', 'profiles')
        OR (c.relname LIKE 'student\_%' ESCAPE '\' AND c.relname <> 'student_opportunities'))
  LOOP
    roles := CASE WHEN item.relname = 'profiles' THEN 'PUBLIC, anon' ELSE 'PUBLIC, anon, authenticated' END;
    EXECUTE format('REVOKE SELECT ON TABLE public.%I FROM %s', item.relname, roles);
    SELECT string_agg(quote_ident(attname), ', ') INTO columns
      FROM pg_attribute WHERE attrelid = item.oid AND attnum > 0 AND NOT attisdropped;
    IF columns IS NOT NULL THEN
      EXECUTE format('REVOKE SELECT (%s) ON TABLE public.%I FROM %s', columns, item.relname, roles);
    END IF;
  END LOOP;
END $$;
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- Require the stricter policies before removing overlapping legacy policies.
DO $$
DECLARE item RECORD;
BEGIN
  FOR item IN SELECT * FROM (VALUES
    ('colleges', 'Public read colleges', 'Public read active college directory'),
    ('entrance_exams', 'Public read entrance_exams', 'Public read published entrance exams'),
    ('syllabus', 'Public read syllabus', 'Public read verified syllabus'),
    ('old_questions', 'Public read old_questions', 'Public read verified old questions')
  ) AS policies(table_name, old_policy, required_policy)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = item.table_name AND policyname = item.required_policy AND cmd = 'SELECT') THEN
      RAISE EXCEPTION 'Missing required read policy on %: %', item.table_name, item.required_policy;
    END IF;
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', item.old_policy, item.table_name);
  END LOOP;
END $$;
-- news and scholarships have no stricter policy in the migration history.
-- Keep their legacy SELECT policies until a separate reviewed change supplies one.

COMMIT;
