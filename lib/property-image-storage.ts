export const PROPERTY_IMAGE_BUCKET = 'property-images';
export const PROPERTY_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const PROPERTY_IMAGE_MAX_FILES = 30;

export const PROPERTY_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type PropertyImageMimeType = (typeof PROPERTY_IMAGE_MIME_TYPES)[number];

const MANAGED_PATH_PATTERN =
  /^(?:properties|uploads)\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpe?g|png|webp)$/i;

export function isManagedPropertyImagePath(path: string): boolean {
  return MANAGED_PATH_PATTERN.test(path);
}

/**
 * Returns a Storage object path only for URLs created by this application.
 * External/shared URLs deliberately return null and are never deleted.
 */
export function getManagedPropertyImagePath(url: string): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  try {
    const parsed = new URL(url);
    const expected = new URL(supabaseUrl);
    if (parsed.origin !== expected.origin) return null;

    const prefix = `/storage/v1/object/public/${PROPERTY_IMAGE_BUCKET}/`;
    if (!parsed.pathname.startsWith(prefix)) return null;

    const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
    return isManagedPropertyImagePath(path) ? path : null;
  } catch {
    return null;
  }
}

export function propertyImageExtension(mimeType: PropertyImageMimeType): string {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  return 'webp';
}

export function hasValidPropertyImageSignature(
  bytes: Uint8Array,
  mimeType: PropertyImageMimeType
): boolean {
  if (mimeType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return bytes.length >= png.length && png.every((value, index) => bytes[index] === value);
  }

  return (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  );
}
