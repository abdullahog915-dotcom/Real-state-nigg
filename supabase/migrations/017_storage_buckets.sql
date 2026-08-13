-- Storage Buckets Setup
-- Migration: 017_storage_buckets.sql
-- Creates storage buckets for images and files

-- Property Images Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Agent Images Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-images', 'agent-images', true)
ON CONFLICT (id) DO NOTHING;

-- Blog Images Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Site Assets Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- =====================
-- STORAGE POLICIES
-- =====================

-- Property Images: Public can view, Admins can upload/delete
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

CREATE POLICY "Admins can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images'
    AND is_admin()
  );

CREATE POLICY "Admins can delete property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND is_admin()
  );

-- Agent Images: Public can view, Admins can upload/delete
CREATE POLICY "Anyone can view agent images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'agent-images');

CREATE POLICY "Admins can upload agent images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'agent-images'
    AND is_admin()
  );

CREATE POLICY "Admins can delete agent images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'agent-images'
    AND is_admin()
  );

-- Blog Images: Public can view, Admins can upload/delete
CREATE POLICY "Anyone can view blog images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images'
    AND is_admin()
  );

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND is_admin()
  );

-- Site Assets: Public can view, Admins can upload/delete
CREATE POLICY "Anyone can view site assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'site-assets'
    AND is_admin()
  );

CREATE POLICY "Admins can delete site assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'site-assets'
    AND is_admin()
  );
