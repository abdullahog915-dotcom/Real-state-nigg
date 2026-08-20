const MEBIBYTE = 1024 * 1024;

export const DEFAULT_API_BODY_LIMIT = MEBIBYTE;
export const SITE_ASSET_API_BODY_LIMIT = 32 * MEBIBYTE;
export const PROPERTY_IMAGE_REQUEST_LIMIT = 52 * MEBIBYTE;

export function apiBodyLimitForPath(pathname: string): number {
  if (pathname === '/api/admin/site-assets') return SITE_ASSET_API_BODY_LIMIT;
  if (pathname === '/api/admin/property-images') return PROPERTY_IMAGE_REQUEST_LIMIT;
  return DEFAULT_API_BODY_LIMIT;
}

export function contentLengthExceedsLimit(headers: Headers, limit: number): boolean {
  const rawContentLength = headers.get('content-length');
  if (rawContentLength === null) return false;

  const contentLength = Number(rawContentLength);
  return Number.isFinite(contentLength) && contentLength > limit;
}
