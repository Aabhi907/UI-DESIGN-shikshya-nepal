-- Interim safety/privacy report route: safety@ and privacy@sikshyanepal.com bounce
-- because that domain is unregistered. This gives students a working route that
-- does not depend on it, until the domain move (Build Brief 10) lands.

CREATE TABLE IF NOT EXISTS safety_privacy_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concern_type TEXT NOT NULL CHECK (concern_type IN ('safety', 'privacy', 'other')),
  source_page TEXT NOT NULL CHECK (source_page IN ('safety', 'privacy')),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 4000),
  contact TEXT CHECK (contact IS NULL OR char_length(contact) BETWEEN 3 AND 200),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_privacy_reports_status ON safety_privacy_reports(status, created_at DESC);

ALTER TABLE safety_privacy_reports ENABLE ROW LEVEL SECURITY;

-- No SELECT/UPDATE/DELETE policy: default deny for anon and authenticated.
-- The admin API reads and updates through the service-role client after an
-- isStaff() check, the same model as data_corrections.
CREATE POLICY "Anyone can report a safety or privacy concern" ON safety_privacy_reports
  FOR INSERT TO anon WITH CHECK (status = 'open');

REVOKE ALL ON TABLE safety_privacy_reports FROM anon, authenticated;
GRANT INSERT ON TABLE safety_privacy_reports TO anon;
GRANT ALL ON TABLE safety_privacy_reports TO service_role;

COMMENT ON TABLE safety_privacy_reports IS 'Interim safety/privacy reports, collected while safety@/privacy@sikshyanepal.com are unreachable (unregistered domain).';

-- Extend the shared public-form rate limiter with this new action.
ALTER TABLE public.public_form_attempts
  DROP CONSTRAINT IF EXISTS public_form_attempts_action_check;

ALTER TABLE public.public_form_attempts
  ADD CONSTRAINT public_form_attempts_action_check
  CHECK (action IN ('subscribe', 'correction', 'college_submission', 'school_submission', 'account_registration', 'safety_report'));

CREATE OR REPLACE FUNCTION public.consume_public_form_rate_limit(
  p_action TEXT,
  p_fingerprint_hash TEXT,
  p_limit INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE attempt_count INTEGER;
BEGIN
  IF p_limit < 1 OR p_action NOT IN ('subscribe', 'correction', 'college_submission', 'school_submission', 'account_registration', 'safety_report') THEN
    RAISE EXCEPTION 'Invalid rate limit action';
  END IF;

  DELETE FROM public_form_attempts WHERE expires_at < NOW();
  INSERT INTO public_form_attempts (action, fingerprint_hash) VALUES (p_action, p_fingerprint_hash);
  SELECT COUNT(*) INTO attempt_count
  FROM public_form_attempts
  WHERE action = p_action
    AND fingerprint_hash = p_fingerprint_hash
    AND created_at >= NOW() - INTERVAL '1 hour';

  RETURN attempt_count <= p_limit;
END;
$$;
