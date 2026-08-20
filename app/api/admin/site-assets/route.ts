import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  contentLengthExceedsLimit,
  SITE_ASSET_API_BODY_LIMIT,
} from '@/lib/api-request-size';
import { adminApiGuard } from '@/lib/auth';
import {
  createSiteAssetPath,
  getManagedSiteAssetPath,
  getSiteAssetPublicUrl,
  hasValidSiteAssetSignature,
  hasMp4FileExtension,
  isManagedSiteAssetPath,
  isSiteAssetSizeAllowed,
  isVideoPurpose,
  SITE_ASSET_BUCKET,
  SITE_IMAGE_MIME_TYPES,
  SITE_VIDEO_MIME_TYPE,
  siteAssetMaxBytes,
  type SiteAssetMimeType,
  type SiteAssetPurpose,
} from '@/lib/site-asset-storage';
import { createClient } from '@/lib/supabase/server';

const purposeSchema = z.enum([
  'logo',
  'favicon',
  'banner-desktop',
  'banner-mobile',
  'banner-poster',
  'banner-desktop-video',
  'banner-mobile-video',
]);
const deleteSchema = z.object({ path: z.string().max(300) });

function assetError(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;

  if (contentLengthExceedsLimit(request.headers, SITE_ASSET_API_BODY_LIMIT)) {
    return assetError('Request body too large.', 413);
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  const purposeResult = purposeSchema.safeParse(form?.get('purpose'));
  if (!(file instanceof File) || !purposeResult.success) {
    return assetError('Select an image and a valid upload purpose');
  }
  const purpose = purposeResult.data as SiteAssetPurpose;
  const video = isVideoPurpose(purpose);
  if (video && (file.type !== SITE_VIDEO_MIME_TYPE || !hasMp4FileExtension(file.name))) {
    return assetError('Video banners require an MP4 file with video/mp4 MIME type');
  }
  if (!video && !SITE_IMAGE_MIME_TYPES.includes(file.type as (typeof SITE_IMAGE_MIME_TYPES)[number])) {
    return assetError('Only JPEG, PNG, and WebP images are allowed');
  }
  const maxBytes = siteAssetMaxBytes(purpose);
  if (!isSiteAssetSizeAllowed(purpose, file.size)) {
    const maxMb = maxBytes / (1024 * 1024);
    return assetError(`${video ? 'MP4 files' : 'Images'} must be between 1 byte and ${maxMb} MB`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = file.type as SiteAssetMimeType;
  if (!hasValidSiteAssetSignature(bytes, mimeType)) {
    return assetError('File contents do not match the declared image type');
  }

  const path = createSiteAssetPath(purpose, mimeType);
  const supabase = await createClient();
  const { error } = await supabase.storage.from(SITE_ASSET_BUCKET).upload(path, bytes, {
    cacheControl: '31536000',
    contentType: mimeType,
    upsert: false,
  });
  if (error) {
    console.error('Site asset upload failed.', { code: 'storage_upload_failed' });
    return assetError('Unable to upload this image right now', 500);
  }

  const url = getSiteAssetPublicUrl(path);
  if (!url) {
    await supabase.storage.from(SITE_ASSET_BUCKET).remove([path]);
    return assetError('Unable to create a public image URL', 500);
  }
  return NextResponse.json({ asset: { url, storage_path: path } }, { status: 201 });
}

export async function DELETE(request: Request) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isManagedSiteAssetPath(parsed.data.path)) {
    return assetError('Invalid managed asset path');
  }
  const url = getSiteAssetPublicUrl(parsed.data.path);
  if (!url || getManagedSiteAssetPath(url) !== parsed.data.path) {
    return assetError('Unable to verify this asset', 500);
  }

  const supabase = await createClient();
  const [settings, banners] = await Promise.all([
    supabase.from('site_settings').select('id').eq('value', url).limit(1),
    supabase
      .from('homepage_banners')
      .select('id')
      .or(`desktop_image_url.eq.${url},mobile_image_url.eq.${url},desktop_video_url.eq.${url},mobile_video_url.eq.${url},poster_image_url.eq.${url}`)
      .limit(1),
  ]);
  const bannerTableMissing = ['42P01', 'PGRST205'].includes(banners.error?.code ?? '');
  if (settings.error || (banners.error && !bannerTableMissing)) {
    return assetError('Unable to verify whether this asset is in use', 500);
  }
  if ((settings.data?.length ?? 0) > 0 || (banners.data?.length ?? 0) > 0) {
    return assetError('This asset is still in use', 409);
  }

  const { error } = await supabase.storage.from(SITE_ASSET_BUCKET).remove([parsed.data.path]);
  if (error) return assetError('Unable to remove this image right now', 500);
  return NextResponse.json({ success: true });
}
