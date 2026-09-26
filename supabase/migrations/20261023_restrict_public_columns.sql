-- Requires 20261013_private_community_media.sql (including media_path).
-- New columns on these tables need an explicit GRANT to be publicly readable.
BEGIN;

REVOKE SELECT ON public.community_posts FROM anon, authenticated;
REVOKE SELECT (author_id, fingerprint_hash, moderation_note) ON public.community_posts FROM anon, authenticated;
GRANT SELECT (id, title, body, topic, status, created_at, published_at, updated_at,
  media_url, media_type, media_path, vote_score, public_alias)
  ON public.community_posts TO anon, authenticated;

REVOKE SELECT ON public.community_comments FROM anon, authenticated;
REVOKE SELECT (author_id, fingerprint_hash, moderation_note) ON public.community_comments FROM anon, authenticated;
GRANT SELECT (id, post_id, body, status, created_at, published_at, updated_at,
  vote_score, public_alias) ON public.community_comments TO anon, authenticated;

REVOKE SELECT ON public.reviews FROM anon, authenticated;
REVOKE SELECT (author_id, moderated_by) ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, college_id, rating, review_text, student_name, program, year,
  is_approved, teaching_rating, facilities_rating, administration_rating,
  value_rating, placement_rating, verification_status, moderated_at, created_at,
  attendance_rating, safety_rating, internship_support_rating,
  hidden_costs_reported, hostel_transport_note) ON public.reviews TO anon, authenticated;

REVOKE SELECT ON public.review_responses FROM anon, authenticated;
REVOKE SELECT (responder_id, reviewed_by) ON public.review_responses FROM anon, authenticated;
GRANT SELECT (id, review_id, college_id, response_text, status, reviewed_at,
  created_at) ON public.review_responses TO anon, authenticated;

REVOKE SELECT ON public.college_evidence FROM anon, authenticated;
REVOKE SELECT (reviewed_by) ON public.college_evidence FROM anon, authenticated;
GRANT SELECT (id, college_id, field_key, claim_summary, source_name, source_url,
  source_published_at, checked_at, confidence_score, verification_status,
  extraction_method, reviewed_at, superseded_at, created_at, updated_at)
  ON public.college_evidence TO anon, authenticated;

REVOKE SELECT ON public.colleges FROM anon, authenticated;
REVOKE SELECT (submitted_by, submitter_role, submitter_contact, verified_by, source)
  ON public.colleges FROM anon, authenticated;
GRANT SELECT (id, name, slug, description, location, address, phone, email, website,
  logo_url, cover_url, affiliation, established_year, is_featured, latitude,
  longitude, province, district, local_level, ward_number, verification_status,
  source_name, source_url, last_verified_at, education_levels, facilities,
  created_at, updated_at, status, programs_offered, is_sponsored, sponsor_label,
  sponsor_starts_at, sponsor_ends_at, sponsor_position, sponsor_disclosure)
  ON public.colleges TO anon, authenticated;

REVOKE SELECT ON public.admission_deadline_history FROM anon, authenticated;
REVOKE SELECT (changed_by) ON public.admission_deadline_history FROM anon, authenticated;
GRANT SELECT (id, admission_id, previous_deadline, new_deadline, reason,
  source_url, changed_at) ON public.admission_deadline_history TO anon, authenticated;
DROP POLICY IF EXISTS "Public read admission deadline history" ON public.admission_deadline_history;
CREATE POLICY "Public read admission deadline history"
  ON public.admission_deadline_history FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admissions
    WHERE admissions.id = admission_deadline_history.admission_id
      AND admissions.status = 'published'
  ));

UPDATE public.colleges
SET submitted_by = NULL, submitter_role = NULL, submitter_contact = NULL
WHERE status = 'active';

COMMIT;
