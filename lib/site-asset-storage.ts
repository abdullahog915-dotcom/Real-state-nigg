import {
  getSupabaseProjectOrigin,
  hasValidPropertyImageSignature,
  propertyImageExtension,
  type PropertyImageMimeType,
} from './property-image-storage.ts';

export const SITE_ASSET_BUCKET = 'site-assets';
export const SITE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const SITE_DESKTOP_VIDEO_MAX_BYTES = 25 * 1024 * 1024;
export const SITE_MOBILE_VIDEO_MAX_BYTES = 15 * 1024 * 1024;
// Kept for existing image-upload callers and tests.
export const SITE_ASSET_MAX_BYTES = SITE_IMAGE_MAX_BYTES;

export const SITE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const SITE_VIDEO_MIME_TYPE = 'video/mp4' as const;
export const SITE_ASSET_MIME_TYPES = [...SITE_IMAGE_MIME_TYPES, SITE_VIDEO_MIME_TYPE] as const;
export type SiteImageMimeType = (typeof SITE_IMAGE_MIME_TYPES)[number];
export type SiteAssetMimeType = (typeof SITE_ASSET_MIME_TYPES)[number];
export type SiteAssetPurpose =
  | 'logo'
  | 'favicon'
  | 'banner-desktop'
  | 'banner-mobile'
  | 'banner-poster'
  | 'banner-desktop-video'
  | 'banner-mobile-video';

const UUID_PART = '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const IMAGE_PART = `${UUID_PART}\\.(?:jpe?g|png|webp)`;
const MANAGED_SITE_ASSET_PATTERN = new RegExp(
  `^(?:branding/(?:logo|favicon)/${IMAGE_PART}|homepage/banners/${UUID_PART}/(?:${IMAGE_PART}|poster/${IMAGE_PART}|video/${UUID_PART}\\.mp4))$`,
  'i'
);

export function isVideoPurpose(purpose: SiteAssetPurpose): boolean {
  return purpose === 'banner-desktop-video' || purpose === 'banner-mobile-video';
}

export function hasMp4FileExtension(fileName: string): boolean {
  return fileName.trim().toLowerCase().endsWith('.mp4');
}

export function siteAssetMaxBytes(purpose: SiteAssetPurpose): number {
  if (purpose === 'banner-desktop-video') return SITE_DESKTOP_VIDEO_MAX_BYTES;
  if (purpose === 'banner-mobile-video') return SITE_MOBILE_VIDEO_MAX_BYTES;
  return SITE_IMAGE_MAX_BYTES;
}

export function isSiteAssetSizeAllowed(purpose: SiteAssetPurpose, size: number): boolean {
  return Number.isSafeInteger(size) && size > 0 && size <= siteAssetMaxBytes(purpose);
}

export function isManagedSiteAssetPath(value: string): boolean {
  return MANAGED_SITE_ASSET_PATTERN.test(value);
}

export function createSiteAssetPath(
  purpose: SiteAssetPurpose,
  mimeType: SiteAssetMimeType
): string {
  if (isVideoPurpose(purpose)) {
    if (mimeType !== SITE_VIDEO_MIME_TYPE) throw new Error('Video assets require video/mp4');
    return `homepage/banners/${crypto.randomUUID()}/video/${crypto.randomUUID()}.mp4`;
  }

  if (!SITE_IMAGE_MIME_TYPES.includes(mimeType as SiteImageMimeType)) {
    throw new Error('Image assets require JPEG, PNG, or WebP');
  }
  const extension = propertyImageExtension(mimeType as PropertyImageMimeType);
  if (purpose === 'logo' || purpose === 'favicon') {
    return `branding/${purpose}/${crypto.randomUUID()}.${extension}`;
  }
  if (purpose === 'banner-poster') {
    return `homepage/banners/${crypto.randomUUID()}/poster/${crypto.randomUUID()}.${extension}`;
  }
  return `homepage/banners/${crypto.randomUUID()}/${crypto.randomUUID()}.${extension}`;
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function uint32(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] * 0x1000000
    + bytes[offset + 1] * 0x10000
    + bytes[offset + 2] * 0x100
    + bytes[offset + 3]
  );
}

/** Conservative ISO-BMFF validation: valid box boundaries plus MP4 brands, moov, and mdat. */
export function hasValidMp4Structure(bytes: Uint8Array): boolean {
  if (bytes.length < 32) return false;
  let offset = 0;
  let sawFtyp = false;
  let sawMovie = false;
  let sawMedia = false;
  const mp4Brands = new Set(['isom', 'iso2', 'iso4', 'iso5', 'iso6', 'avc1', 'mp41', 'mp42', 'M4V ', 'MSNV', 'dash']);

  while (offset + 8 <= bytes.length) {
    const size32 = uint32(bytes, offset);
    const type = ascii(bytes, offset + 4, 4);
    let headerSize = 8;
    let boxSize = size32;
    if (size32 === 1) {
      if (offset + 16 > bytes.length) return false;
      const high = uint32(bytes, offset + 8);
      const low = uint32(bytes, offset + 12);
      if (high > 0x1fffff) return false;
      boxSize = high * 0x100000000 + low;
      headerSize = 16;
    } else if (size32 === 0) {
      boxSize = bytes.length - offset;
    }
    if (boxSize < headerSize || offset + boxSize > bytes.length) return false;

    if (type === 'ftyp') {
      if (sawFtyp || offset !== 0 || boxSize < headerSize + 8) return false;
      const brandEnd = offset + boxSize;
      let compatible = mp4Brands.has(ascii(bytes, offset + headerSize, 4));
      for (let cursor = offset + headerSize + 8; cursor + 4 <= brandEnd; cursor += 4) {
        compatible ||= mp4Brands.has(ascii(bytes, cursor, 4));
      }
      if (!compatible) return false;
      sawFtyp = true;
    } else if (type === 'moov') {
      sawMovie = true;
    } else if (type === 'mdat') {
      sawMedia = true;
    }
    offset += boxSize;
  }
  return offset === bytes.length && sawFtyp && sawMovie && sawMedia;
}

export function hasValidSiteAssetSignature(
  bytes: Uint8Array,
  mimeType: SiteAssetMimeType
): boolean {
  return mimeType === SITE_VIDEO_MIME_TYPE
    ? hasValidMp4Structure(bytes)
    : hasValidPropertyImageSignature(bytes, mimeType as PropertyImageMimeType);
}

export function getSiteAssetPublicUrl(path: string): string | null {
  if (!isManagedSiteAssetPath(path)) return null;
  const origin = getSupabaseProjectOrigin();
  if (!origin) return null;
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return new URL(`/storage/v1/object/public/${SITE_ASSET_BUCKET}/${encoded}`, origin).toString();
}

export function getManagedSiteAssetPath(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const origin = getSupabaseProjectOrigin();
    if (!origin || parsed.origin !== origin || parsed.search || parsed.hash) return null;
    const prefix = `/storage/v1/object/public/${SITE_ASSET_BUCKET}/`;
    if (!parsed.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
    return isManagedSiteAssetPath(path) ? path : null;
  } catch {
    return null;
  }
}
