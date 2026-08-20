-- Admin-managed homepage banners for Phase 10.
-- This migration is additive and does not alter existing content.

BEGIN;

CREATE TABLE public.homepage_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 140),
  subtitle TEXT NOT NULL CHECK (char_length(btrim(subtitle)) BETWEEN 2 AND 320),
  desktop_image_url TEXT NOT NULL CHECK (char_length(desktop_image_url) <= 2048),
  mobile_image_url TEXT CHECK (mobile_image_url IS NULL OR char_length(mobile_image_url) <= 2048),
  image_alt TEXT NOT NULL CHECK (char_length(btrim(image_alt)) BETWEEN 2 AND 220),
  cta_label TEXT CHECK (cta_label IS NULL OR char_length(btrim(cta_label)) BETWEEN 2 AND 60),
  cta_url TEXT CHECK (cta_url IS NULL OR char_length(btrim(cta_url)) BETWEEN 1 AND 2048),
  overlay_strength SMALLINT NOT NULL DEFAULT 45 CHECK (overlay_strength BETWEEN 0 AND 90),
  is_active BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order BETWEEN 0 AND 10000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_homepage_banners_public_order
  ON public.homepage_banners (display_order, created_at, id)
  WHERE is_active = true;

CREATE INDEX idx_homepage_banners_admin_order
  ON public.homepage_banners (display_order, created_at, id);

CREATE TRIGGER update_homepage_banners_updated_at
  BEFORE UPDATE ON public.homepage_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active homepage banners"
  ON public.homepage_banners FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage homepage banners"
  ON public.homepage_banners FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

REVOKE INSERT, UPDATE, DELETE ON TABLE public.homepage_banners FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.homepage_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.homepage_banners TO authenticated;
GRANT ALL ON TABLE public.homepage_banners TO service_role;

COMMENT ON TABLE public.homepage_banners IS
  'Ordered, admin-managed homepage hero banners; public reads expose active rows only.';

COMMIT;
