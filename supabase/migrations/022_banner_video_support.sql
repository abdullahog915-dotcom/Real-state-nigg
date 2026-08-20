-- Backward-compatible MP4 support for homepage banners.
-- Existing image banner rows remain media_type = 'image'.

BEGIN;

ALTER TABLE public.homepage_banners
  ADD COLUMN media_type TEXT NOT NULL DEFAULT 'image'
    CHECK (media_type IN ('image', 'video')),
  ADD COLUMN desktop_video_url TEXT
    CHECK (desktop_video_url IS NULL OR char_length(desktop_video_url) <= 2048),
  ADD COLUMN mobile_video_url TEXT
    CHECK (mobile_video_url IS NULL OR char_length(mobile_video_url) <= 2048),
  ADD COLUMN poster_image_url TEXT
    CHECK (poster_image_url IS NULL OR char_length(poster_image_url) <= 2048);

ALTER TABLE public.homepage_banners
  ALTER COLUMN desktop_image_url DROP NOT NULL;

ALTER TABLE public.homepage_banners
  ADD CONSTRAINT homepage_banners_media_requirements CHECK (
    (
      media_type = 'image'
      AND desktop_image_url IS NOT NULL
      AND desktop_video_url IS NULL
      AND mobile_video_url IS NULL
      AND poster_image_url IS NULL
    )
    OR
    (
      media_type = 'video'
      AND desktop_image_url IS NULL
      AND mobile_image_url IS NULL
      AND desktop_video_url IS NOT NULL
    )
  );

-- The bucket limit is per object, not per path. The application retains a
-- stricter 5 MB image/poster cap and a 15 MB mobile-video cap; 25 MB is only
-- available to validated desktop MP4 uploads made through the admin API.
UPDATE storage.buckets
SET file_size_limit = 26214400,
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',
      'video/mp4'
    ]::text[]
WHERE id = 'site-assets';

COMMENT ON COLUMN public.homepage_banners.media_type IS
  'Discriminates legacy-compatible image banners from MP4 video banners.';
COMMENT ON COLUMN public.homepage_banners.poster_image_url IS
  'Optional static fallback for video loading failures and reduced-motion users.';

COMMIT;
