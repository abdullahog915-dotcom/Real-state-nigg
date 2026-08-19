export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

const RATE_LIMIT_MESSAGE = 'Too many requests. Please try again shortly.';
const RETRY_AFTER_SECONDS = 60;
const UNKNOWN_CLOUDFLARE_IP = 'unknown-cloudflare-ip';

/**
 * Use only Cloudflare's authoritative client-IP header. Deliberately do not
 * trust x-forwarded-for or other browser-supplied identity headers.
 */
export function getCloudflareClientIp(request: Request): string {
  const clientIp = request.headers.get('cf-connecting-ip')?.trim();
  return clientIp && clientIp.length <= 64 ? clientIp : UNKNOWN_CLOUDFLARE_IP;
}

export function publicRateLimitKey(endpoint: string, request: Request): string {
  return `public:${endpoint}:${getCloudflareClientIp(request)}`;
}

/** The caller must provide a user ID verified by Supabase Auth on the server. */
export function authenticatedRateLimitKey(group: string, verifiedUserId: string): string {
  return `authenticated:${group}:${verifiedUserId}`;
}

export function rateLimitExceededResponse(): Response {
  return Response.json(
    { error: RATE_LIMIT_MESSAGE },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(RETRY_AFTER_SECONDS),
      },
    }
  );
}

export async function checkRateLimit(
  binding: RateLimitBinding,
  key: string
): Promise<Response | null> {
  const { success } = await binding.limit({ key });
  return success ? null : rateLimitExceededResponse();
}
