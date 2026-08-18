-- Phase 8 security hardening
-- Migration: 019_security_hardening.sql
--
-- Narrows anonymous lead inserts, limits agents to assigned records, hardens
-- SECURITY DEFINER functions, and adds defense-in-depth Storage limits.

-- SECURITY DEFINER functions must not resolve objects through a caller-
-- controlled search path. All referenced schemas are explicit below.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_agent()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = (SELECT auth.uid())
      AND role IN ('agent', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_agent() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_agent() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Anonymous callers use the REST API directly as well as the application API.
-- Enforce the same immutable initial state and basic validation in RLS.
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.inquiries;
CREATE POLICY "Anyone can submit valid inquiries"
  ON public.inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    property_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.properties
      WHERE properties.id = inquiries.property_id
        AND properties.status IN ('published', 'featured')
    )
    AND char_length(btrim(name)) BETWEEN 2 AND 100
    AND char_length(btrim(email)) BETWEEN 3 AND 255
    AND position('@' IN email) > 1
    AND (phone IS NULL OR char_length(btrim(phone)) <= 20)
    AND char_length(btrim(message)) BETWEEN 10 AND 2000
    AND source = 'website'
    AND status = 'new'
    AND assigned_agent_id IS NULL
    AND notes IS NULL
  );

DROP POLICY IF EXISTS "Anyone can submit viewing requests" ON public.viewing_requests;
CREATE POLICY "Anyone can submit valid viewing requests"
  ON public.viewing_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.properties
      WHERE properties.id = viewing_requests.property_id
        AND properties.status IN ('published', 'featured')
    )
    AND char_length(btrim(name)) BETWEEN 2 AND 100
    AND char_length(btrim(email)) BETWEEN 3 AND 255
    AND position('@' IN email) > 1
    AND char_length(btrim(phone)) BETWEEN 7 AND 20
    AND preferred_date >= CURRENT_DATE
    AND (message IS NULL OR char_length(btrim(message)) <= 2000)
    AND status = 'requested'
    AND agent_id IS NULL
    AND notes IS NULL
  );

DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Anyone can submit valid contact forms"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(btrim(name)) BETWEEN 2 AND 100
    AND char_length(btrim(email)) BETWEEN 3 AND 255
    AND position('@' IN email) > 1
    AND (phone IS NULL OR char_length(btrim(phone)) <= 20)
    AND char_length(btrim(message)) BETWEEN 10 AND 2000
    AND status = 'new'
  );

-- Agents may see only records assigned to their linked agent row. Admins keep
-- complete access through their existing management policies.
DROP POLICY IF EXISTS "Admins and agents can view inquiries" ON public.inquiries;
CREATE POLICY "Agents can view assigned inquiries"
  ON public.inquiries FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR assigned_agent_id IN (
      SELECT agents.id
      FROM public.agents
      WHERE agents.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins and agents can view viewing requests" ON public.viewing_requests;
CREATE POLICY "Agents can view assigned viewing requests"
  ON public.viewing_requests FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR agent_id IN (
      SELECT agents.id
      FROM public.agents
      WHERE agents.user_id = (SELECT auth.uid())
    )
  );

-- RLS chooses the rows an agent can update; these triggers ensure direct REST
-- updates cannot rewrite customer identity, assignment, or property fields.
CREATE OR REPLACE FUNCTION public.protect_inquiry_agent_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF char_length(COALESCE(NEW.notes, '')) > 2000 THEN
    RAISE EXCEPTION 'Inquiry notes are too long' USING ERRCODE = '22001';
  END IF;

  IF NOT public.is_admin() THEN
    NEW.property_id := OLD.property_id;
    NEW.name := OLD.name;
    NEW.email := OLD.email;
    NEW.phone := OLD.phone;
    NEW.message := OLD.message;
    NEW.source := OLD.source;
    NEW.assigned_agent_id := OLD.assigned_agent_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_viewing_agent_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF char_length(COALESCE(NEW.notes, '')) > 2000 THEN
    RAISE EXCEPTION 'Viewing notes are too long' USING ERRCODE = '22001';
  END IF;

  IF NOT public.is_admin() THEN
    NEW.property_id := OLD.property_id;
    NEW.name := OLD.name;
    NEW.email := OLD.email;
    NEW.phone := OLD.phone;
    NEW.preferred_date := OLD.preferred_date;
    NEW.preferred_time := OLD.preferred_time;
    NEW.message := OLD.message;
    NEW.agent_id := OLD.agent_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_inquiry_agent_fields ON public.inquiries;
CREATE TRIGGER protect_inquiry_agent_fields
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_inquiry_agent_fields();

DROP TRIGGER IF EXISTS protect_viewing_agent_fields ON public.viewing_requests;
CREATE TRIGGER protect_viewing_agent_fields
  BEFORE UPDATE ON public.viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_viewing_agent_fields();

REVOKE EXECUTE ON FUNCTION public.protect_inquiry_agent_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_viewing_agent_fields() FROM PUBLIC, anon, authenticated;

-- Bucket restrictions backstop direct Storage API uploads. The application
-- still performs stricter binary-structure checks for property images.
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
WHERE id IN ('property-images', 'agent-images', 'blog-images');

UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/x-icon'
    ]::text[]
WHERE id = 'site-assets';
