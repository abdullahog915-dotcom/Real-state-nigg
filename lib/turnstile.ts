const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_TOKEN_LENGTH = 2048;
const VERIFY_TIMEOUT_MS = 5000;

export type TurnstileAction = 'contact' | 'inquiry' | 'viewing' | 'login' | 'signup';

interface SiteverifyResponse {
  success: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
}

function allowedHostnames(): string[] {
  const configured = process.env.TURNSTILE_ALLOWED_HOSTNAMES
    ?.split(',')
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);

  if (configured?.length) return configured;

  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      return [new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname.toLowerCase()];
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Verify a public-form Turnstile token without exposing the verification secret.
 * Missing keys bypass verification only outside production so local development
 * remains usable; production fails closed when configuration is incomplete.
 */
export async function verifyTurnstileToken(
  request: Request,
  token: string | undefined,
  expectedAction: TurnstileAction
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV !== 'production') return true;
    console.error('Turnstile verification is unavailable: secret is not configured.');
    return false;
  }

  if (!token || token.length > MAX_TOKEN_LENGTH) return false;

  const formData = new FormData();
  formData.set('secret', secret);
  formData.set('response', token);

  const remoteIp = request.headers.get('cf-connecting-ip');
  if (remoteIp && remoteIp.length <= 64) formData.set('remoteip', remoteIp);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn('Turnstile verification service returned a non-success status.');
      return false;
    }

    const result = (await response.json()) as SiteverifyResponse;
    if (!result.success || result.action !== expectedAction) {
      console.warn('Turnstile verification rejected a form submission.');
      return false;
    }

    const hostnames = allowedHostnames();
    if (hostnames.length > 0) {
      const hostname = result.hostname?.toLowerCase();
      if (!hostname || !hostnames.includes(hostname)) {
        console.warn('Turnstile verification returned an unexpected hostname.');
        return false;
      }
    }

    return true;
  } catch {
    console.warn('Turnstile verification could not be completed.');
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
