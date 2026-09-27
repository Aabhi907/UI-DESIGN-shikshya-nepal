-- Founder-run after 20261024; extends the existing rolling-hour action contract.
BEGIN;

ALTER TABLE public.public_form_attempts
  DROP CONSTRAINT IF EXISTS public_form_attempts_action_check;
ALTER TABLE public.public_form_attempts
  ADD CONSTRAINT public_form_attempts_action_check
  CHECK (action IN ('subscribe', 'correction', 'college_submission', 'school_submission', 'account_registration', 'admission_enquiry', 'safety_report', 'account_login', 'admin_login'));

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
  IF p_limit IS NULL OR p_limit < 1 OR p_action IS NULL OR p_action NOT IN ('subscribe', 'correction', 'college_submission', 'account_registration', 'admission_enquiry', 'safety_report', 'account_login', 'admin_login') THEN
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

COMMIT;
