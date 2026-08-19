export const PROPERTY_IMAGE_BUCKET = 'property-images';
export const PROPERTY_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const PROPERTY_IMAGE_MAX_BATCH_BYTES = 50 * 1024 * 1024;
export const PROPERTY_IMAGE_MAX_FILES = 30;

export const PROPERTY_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type PropertyImageMimeType = (typeof PROPERTY_IMAGE_MIME_TYPES)[number];

const UUID_PART = '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const IMAGE_PART = `${UUID_PART}\\.(?:jpe?g|png|webp)`;
const MANAGED_PATH_PATTERN = new RegExp(
  `^(?:properties/${UUID_PART}/${IMAGE_PART}|uploads/${UUID_PART}(?:/${UUID_PART})?/${IMAGE_PART})$`,
  'i'
);

/** Parse an absolute HTTP(S) URL without ever throwing on untrusted input. */
export function parseHttpUrl(value: string | null | undefined): URL | null {
  if (!value || typeof value !== 'string') return null;

  const candidate = value.trim();
  if (!candidate) return null;

  try {
    if (typeof URL.canParse === 'function' && !URL.canParse(candidate)) return null;
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed : null;
  } catch {
    return null;
  }
}

/** Return the configured Supabase project origin, or null for missing/invalid configuration. */
export function getSupabaseProjectOrigin(): string | null {
  return parseHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)?.origin ?? null;
}

export function isManagedPropertyImagePath(path: string): boolean {
  return MANAGED_PATH_PATTERN.test(path);
}

/**
 * Returns a Storage object path only for URLs created by this application.
 * External/shared URLs deliberately return null and are never deleted.
 */
export function getManagedPropertyImagePath(url: string): string | null {
  try {
    const parsed = parseHttpUrl(url);
    const expectedOrigin = getSupabaseProjectOrigin();
    if (!parsed || !expectedOrigin || parsed.origin !== expectedOrigin) return null;
    if (parsed.search || parsed.hash) return null;

    const prefix = `/storage/v1/object/public/${PROPERTY_IMAGE_BUCKET}/`;
    if (!parsed.pathname.startsWith(prefix)) return null;

    const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
    return isManagedPropertyImagePath(path) ? path : null;
  } catch {
    return null;
  }
}

/** Build the canonical public URL only for a strictly managed object path. */
export function getPropertyImagePublicUrl(path: string): string | null {
  if (!isManagedPropertyImagePath(path)) return null;

  const origin = getSupabaseProjectOrigin();
  if (!origin) return null;

  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  try {
    return new URL(
      `/storage/v1/object/public/${PROPERTY_IMAGE_BUCKET}/${encodedPath}`,
      origin
    ).toString();
  } catch {
    return null;
  }
}

export function propertyImageExtension(mimeType: PropertyImageMimeType): string {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  return 'webp';
}

function readUint32BigEndian(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] * 0x1000000
    + bytes[offset + 1] * 0x10000
    + bytes[offset + 2] * 0x100
    + bytes[offset + 3]
  );
}

function readUint32LittleEndian(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset]
    + bytes[offset + 1] * 0x100
    + bytes[offset + 2] * 0x10000
    + bytes[offset + 3] * 0x1000000
  );
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function hasValidJpegStructure(bytes: Uint8Array): boolean {
  if (
    bytes.length < 11
    || bytes[0] !== 0xff
    || bytes[1] !== 0xd8
    || bytes[bytes.length - 2] !== 0xff
    || bytes[bytes.length - 1] !== 0xd9
  ) {
    return false;
  }

  let offset = 2;
  let sawStartOfFrame = false;
  while (offset < bytes.length - 2) {
    if (bytes[offset] !== 0xff) return false;
    while (bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length - 2) return false;

    const marker = bytes[offset];
    offset += 1;

    // Standalone markers have no length field.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (marker === 0xd8 || marker === 0xd9 || offset + 2 > bytes.length) return false;

    const segmentLength = bytes[offset] * 0x100 + bytes[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return false;

    const isStartOfFrame =
      marker >= 0xc0
      && marker <= 0xcf
      && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isStartOfFrame) {
      if (segmentLength < 8) return false;
      const height = bytes[offset + 3] * 0x100 + bytes[offset + 4];
      const width = bytes[offset + 5] * 0x100 + bytes[offset + 6];
      if (height === 0 || width === 0) return false;
      sawStartOfFrame = true;
    }

    // Entropy-coded scan data may contain arbitrary bytes. At this point the
    // validated SOF plus terminal EOI markers are the structural boundary.
    if (marker === 0xda) return sawStartOfFrame;
    offset += segmentLength;
  }

  return false;
}

function hasValidPngStructure(bytes: Uint8Array): boolean {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 45 || !signature.every((value, index) => bytes[index] === value)) {
    return false;
  }

  let offset = 8;
  let sawHeader = false;
  let sawImageData = false;
  while (offset + 12 <= bytes.length) {
    const chunkLength = readUint32BigEndian(bytes, offset);
    const chunkEnd = offset + 12 + chunkLength;
    if (chunkEnd > bytes.length) return false;

    const chunkType = ascii(bytes, offset + 4, 4);
    if (!sawHeader) {
      if (chunkType !== 'IHDR' || chunkLength !== 13) return false;
      const width = readUint32BigEndian(bytes, offset + 8);
      const height = readUint32BigEndian(bytes, offset + 12);
      if (width === 0 || height === 0) return false;
      sawHeader = true;
    }
    if (chunkType === 'IDAT') sawImageData = true;
    if (chunkType === 'IEND') {
      return chunkLength === 0 && sawHeader && sawImageData && chunkEnd === bytes.length;
    }

    offset = chunkEnd;
  }

  return false;
}

function hasValidWebpStructure(bytes: Uint8Array): boolean {
  if (
    bytes.length < 20
    || ascii(bytes, 0, 4) !== 'RIFF'
    || ascii(bytes, 8, 4) !== 'WEBP'
    || readUint32LittleEndian(bytes, 4) + 8 !== bytes.length
  ) {
    return false;
  }

  let offset = 12;
  let sawImageChunk = false;
  while (offset + 8 <= bytes.length) {
    const chunkType = ascii(bytes, offset, 4);
    const chunkLength = readUint32LittleEndian(bytes, offset + 4);
    const chunkEnd = offset + 8 + chunkLength;
    if (chunkEnd > bytes.length) return false;
    if (chunkType === 'VP8 ' || chunkType === 'VP8L' || chunkType === 'VP8X') {
      sawImageChunk = true;
    }
    offset = chunkEnd + (chunkLength % 2);
  }

  return sawImageChunk && offset === bytes.length;
}

export function hasValidPropertyImageSignature(
  bytes: Uint8Array,
  mimeType: PropertyImageMimeType
): boolean {
  if (mimeType === 'image/jpeg') {
    return hasValidJpegStructure(bytes);
  }

  if (mimeType === 'image/png') {
    return hasValidPngStructure(bytes);
  }

  return hasValidWebpStructure(bytes);
}
