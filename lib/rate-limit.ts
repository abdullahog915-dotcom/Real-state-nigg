import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  authenticatedRateLimitKey,
  checkRateLimit,
  publicRateLimitKey,
  type RateLimitBinding,
} from '@/lib/rate-limit-core';

declare global {
  interface CloudflareEnv {
    PUBLIC_FORM_RATE_LIMITER?: RateLimitBinding;
    AUTH_CALLBACK_RATE_LIMITER?: RateLimitBinding;
    FAVORITES_RATE_LIMITER?: RateLimitBinding;
    ADMIN_PROPERTY_IMAGE_RATE_LIMITER?: RateLimitBinding;
    ADMIN_MUTATION_RATE_LIMITER?: RateLimitBinding;
  }
}

type RateLimitBindingName =
  | 'PUBLIC_FORM_RATE_LIMITER'
  | 'AUTH_CALLBACK_RATE_LIMITER'
  | 'FAVORITES_RATE_LIMITER'
  | 'ADMIN_PROPERTY_IMAGE_RATE_LIMITER'
  | 'ADMIN_MUTATION_RATE_LIMITER';

function rateLimitUnavailableResponse(): Response {
  return Response.json(
    { error: 'Unable to process this request right now. Please try again shortly.' },
    {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': '60',
      },
    }
  );
}

async function enforceRateLimit(
  bindingName: RateLimitBindingName,
  key: string
): Promise<Response | null> {
  try {
    const binding = getCloudflareContext().env[bindingName];
    if (!binding) {
      console.error('Cloudflare rate limiting is unavailable for this request.');
      return rateLimitUnavailableResponse();
    }

    return await checkRateLimit(binding, key);
  } catch (error) {
    console.error('Cloudflare rate limiting could not be evaluated.', {
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });
    return rateLimitUnavailableResponse();
  }
}

export function rateLimitPublicForm(
  request: Request,
  endpoint: '/api/contact' | '/api/inquiries' | '/api/viewing-requests'
): Promise<Response | null> {
  return enforceRateLimit('PUBLIC_FORM_RATE_LIMITER', publicRateLimitKey(endpoint, request));
}

export function rateLimitAuthCallback(request: Request): Promise<Response | null> {
  return enforceRateLimit(
    'AUTH_CALLBACK_RATE_LIMITER',
    publicRateLimitKey('/auth/callback', request)
  );
}

export function rateLimitFavorites(verifiedUserId: string): Promise<Response | null> {
  return enforceRateLimit(
    'FAVORITES_RATE_LIMITER',
    authenticatedRateLimitKey('favorites', verifiedUserId)
  );
}

export function rateLimitAdminPropertyImages(
  verifiedAdminUserId: string
): Promise<Response | null> {
  return enforceRateLimit(
    'ADMIN_PROPERTY_IMAGE_RATE_LIMITER',
    authenticatedRateLimitKey('admin-property-images', verifiedAdminUserId)
  );
}

export function rateLimitAdminMutations(verifiedAdminUserId: string): Promise<Response | null> {
  return enforceRateLimit(
    'ADMIN_MUTATION_RATE_LIMITER',
    authenticatedRateLimitKey('admin-mutations', verifiedAdminUserId)
  );
}
