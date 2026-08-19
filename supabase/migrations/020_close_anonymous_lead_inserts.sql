-- Close direct Data API inserts into public lead tables.
-- Trusted Cloudflare route handlers insert with a server-only Supabase secret
-- after rate limiting, validation, and Turnstile verification.

BEGIN;

-- Preserve RLS explicitly. The trusted server key bypasses RLS, while browser
-- roles retain only their existing read/update access where policies allow it.
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;

-- Remove both the current migration-019 policies and their legacy names so the
-- migration is safe across environments that may have slightly different history.
DROP POLICY IF EXISTS "Anyone can submit valid contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit valid inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can submit valid viewing requests" ON public.viewing_requests;
DROP POLICY IF EXISTS "Anyone can submit viewing requests" ON public.viewing_requests;

-- Policy removal is the RLS boundary; privilege revocation is an independent
-- backstop preventing both anonymous and ordinary authenticated direct inserts.
REVOKE INSERT ON TABLE public.contact_submissions FROM PUBLIC, anon, authenticated;
REVOKE INSERT ON TABLE public.inquiries FROM PUBLIC, anon, authenticated;
REVOKE INSERT ON TABLE public.viewing_requests FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.contact_submissions TO service_role;
GRANT INSERT ON TABLE public.inquiries TO service_role;
GRANT INSERT ON TABLE public.viewing_requests TO service_role;

-- Existing admin ALL policies on contact/viewing include INSERT. Replace them
-- with explicit non-insert policies while preserving current admin operations.
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (public.is_admin());
CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete contact submissions"
  ON public.contact_submissions FOR DELETE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage viewing requests" ON public.viewing_requests;
CREATE POLICY "Admins can update viewing requests"
  ON public.viewing_requests FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete viewing requests"
  ON public.viewing_requests FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- RLS is bypassed by the trusted key. Insert-only triggers retain migration
-- 019's defense-in-depth checks without constraining later admin/agent updates.
CREATE OR REPLACE FUNCTION public.enforce_contact_submission_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF char_length(btrim(NEW.name)) NOT BETWEEN 2 AND 100
     OR char_length(btrim(NEW.email)) NOT BETWEEN 3 AND 255
     OR position('@' IN NEW.email) <= 1
     OR (NEW.phone IS NOT NULL AND char_length(btrim(NEW.phone)) > 20)
     OR char_length(btrim(NEW.message)) NOT BETWEEN 10 AND 2000
     OR NEW.status IS DISTINCT FROM 'new' THEN
    RAISE EXCEPTION 'Invalid contact submission' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_inquiry_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.property_id IS NULL
     OR NOT EXISTS (
       SELECT 1
       FROM public.properties
       WHERE properties.id = NEW.property_id
         AND properties.status IN ('published', 'featured')
     )
     OR char_length(btrim(NEW.name)) NOT BETWEEN 2 AND 100
     OR char_length(btrim(NEW.email)) NOT BETWEEN 3 AND 255
     OR position('@' IN NEW.email) <= 1
     OR (NEW.phone IS NOT NULL AND char_length(btrim(NEW.phone)) > 20)
     OR char_length(btrim(NEW.message)) NOT BETWEEN 10 AND 2000
     OR NEW.source IS DISTINCT FROM 'website'
     OR NEW.status IS DISTINCT FROM 'new'
     OR NEW.assigned_agent_id IS NOT NULL
     OR NEW.notes IS NOT NULL THEN
    RAISE EXCEPTION 'Invalid inquiry submission' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_viewing_request_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
       SELECT 1
       FROM public.properties
       WHERE properties.id = NEW.property_id
         AND properties.status IN ('published', 'featured')
     )
     OR char_length(btrim(NEW.name)) NOT BETWEEN 2 AND 100
     OR char_length(btrim(NEW.email)) NOT BETWEEN 3 AND 255
     OR position('@' IN NEW.email) <= 1
     OR char_length(btrim(NEW.phone)) NOT BETWEEN 7 AND 20
     OR NEW.preferred_date < CURRENT_DATE
     OR (NEW.message IS NOT NULL AND char_length(btrim(NEW.message)) > 2000)
     OR NEW.status IS DISTINCT FROM 'requested'
     OR NEW.agent_id IS NOT NULL
     OR NEW.notes IS NOT NULL THEN
    RAISE EXCEPTION 'Invalid viewing request' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_contact_submission_insert ON public.contact_submissions;
CREATE TRIGGER enforce_contact_submission_insert
  BEFORE INSERT ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_contact_submission_insert();

DROP TRIGGER IF EXISTS enforce_inquiry_insert ON public.inquiries;
CREATE TRIGGER enforce_inquiry_insert
  BEFORE INSERT ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_inquiry_insert();

DROP TRIGGER IF EXISTS enforce_viewing_request_insert ON public.viewing_requests;
CREATE TRIGGER enforce_viewing_request_insert
  BEFORE INSERT ON public.viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_viewing_request_insert();

REVOKE EXECUTE ON FUNCTION public.enforce_contact_submission_insert()
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_inquiry_insert()
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_viewing_request_insert()
  FROM PUBLIC, anon, authenticated;

COMMIT;
