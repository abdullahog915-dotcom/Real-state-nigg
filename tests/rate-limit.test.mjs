import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  authenticatedRateLimitKey,
  checkRateLimit,
  publicRateLimitKey,
} from '../lib/rate-limit-core.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

class CountingRateLimitBinding {
  #counts = Object.create(null);

  constructor(limit) {
    this.limitValue = limit;
  }

  async limit({ key }) {
    const count = (this.#counts[key] ?? 0) + 1;
    this.#counts[key] = count;
    return { success: count <= this.limitValue };
  }
}

function source(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function adminRouteFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return adminRouteFiles(path);
    return entry.name === 'route.ts' ? [path] : [];
  });
}

test('allows requests through the configured threshold and returns a generic 429 afterward', async () => {
  const binding = new CountingRateLimitBinding(5);

  for (let requestNumber = 1; requestNumber <= 5; requestNumber += 1) {
    assert.equal(await checkRateLimit(binding, 'public:/api/contact:203.0.113.10'), null);
  }

  const response = await checkRateLimit(binding, 'public:/api/contact:203.0.113.10');
  assert.equal(response?.status, 429);
  assert.equal(response?.headers.get('Retry-After'), '60');
  assert.deepEqual(await response?.json(), {
    error: 'Too many requests. Please try again shortly.',
  });
});

test('public endpoint keys isolate quotas for the same Cloudflare client IP', async () => {
  const binding = new CountingRateLimitBinding(1);
  const request = new Request('https://example.test', {
    headers: { 'cf-connecting-ip': '203.0.113.11' },
  });
  const contactKey = publicRateLimitKey('/api/contact', request);
  const inquiryKey = publicRateLimitKey('/api/inquiries', request);

  assert.notEqual(contactKey, inquiryKey);
  assert.equal(await checkRateLimit(binding, contactKey), null);
  assert.equal((await checkRateLimit(binding, contactKey))?.status, 429);
  assert.equal(await checkRateLimit(binding, inquiryKey), null);
});

test('authenticated users have separate quotas and spoofable request identity is ignored', async () => {
  const verifiedUserA = '11111111-1111-4111-8111-111111111111';
  const verifiedUserB = '22222222-2222-4222-8222-222222222222';
  const spoofedUser = '33333333-3333-4333-8333-333333333333';
  const spoofedRequest = new Request('https://example.test/api/favorites', {
    headers: { 'x-user-id': spoofedUser },
  });

  const userAKey = authenticatedRateLimitKey('favorites', verifiedUserA);
  const userBKey = authenticatedRateLimitKey('favorites', verifiedUserB);
  assert.notEqual(userAKey, userBKey);
  assert.equal(userAKey.includes(spoofedRequest.headers.get('x-user-id')), false);

  const binding = new CountingRateLimitBinding(1);
  assert.equal(await checkRateLimit(binding, userAKey), null);
  assert.equal((await checkRateLimit(binding, userAKey))?.status, 429);
  assert.equal(await checkRateLimit(binding, userBKey), null);

  const favoritesSource = source('app/api/favorites/route.ts');
  assert.equal((favoritesSource.match(/rateLimitFavorites\(user\.id\)/g) ?? []).length, 2);
  assert.equal(favoritesSource.includes('x-user-id'), false);
});

test('Wrangler declares five independent native limiter namespaces with exact thresholds', () => {
  const config = JSON.parse(source('wrangler.jsonc'));
  const expected = {
    PUBLIC_FORM_RATE_LIMITER: [5, 60],
    AUTH_CALLBACK_RATE_LIMITER: [10, 60],
    FAVORITES_RATE_LIMITER: [60, 60],
    ADMIN_PROPERTY_IMAGE_RATE_LIMITER: [10, 60],
    ADMIN_MUTATION_RATE_LIMITER: [60, 60],
  };

  assert.equal(config.ratelimits.length, 5);
  const namespaceIds = config.ratelimits.map((binding) => binding.namespace_id);
  assert.equal(
    namespaceIds.every((id, index) => namespaceIds.indexOf(id) === index),
    true
  );
  for (const binding of config.ratelimits) {
    assert.deepEqual(
      [binding.simple.limit, binding.simple.period],
      expected[binding.name],
      binding.name
    );
  }
});

test('public form rate checks run before preserved Turnstile verification', () => {
  for (const route of ['contact', 'inquiries', 'viewing-requests']) {
    const routeSource = source(`app/api/${route}/route.ts`);
    const rateLimitIndex = routeSource.indexOf('await rateLimitPublicForm(');
    const turnstileIndex = routeSource.indexOf('await verifyTurnstileToken(');
    assert.ok(rateLimitIndex >= 0, `${route} is rate limited`);
    assert.ok(turnstileIndex > rateLimitIndex, `${route} preserves Turnstile after rate limiting`);
  }
});

test('auth callback is limited before exchanging a code for a session', () => {
  const callbackSource = source('app/auth/callback/route.ts');
  assert.ok(
    callbackSource.indexOf('await rateLimitAuthCallback(')
      < callbackSource.indexOf('auth.exchangeCodeForSession(')
  );
});

test('every admin mutation keeps authorization and uses the correct authenticated limiter group', () => {
  const files = adminRouteFiles(join(root, 'app', 'api', 'admin'));
  assert.ok(files.length >= 14, 'the existing admin API surface remains present');

  for (const file of files) {
    const routeSource = readFileSync(file, 'utf8');
    const mutationCount = (routeSource.match(/export async function (?:POST|PUT|PATCH|DELETE)\b/g) ?? [])
      .length;
    const expectedGroup = file.endsWith(join('property-images', 'route.ts'))
      ? 'property-images'
      : 'mutation';
    const guardCalls = routeSource.match(
      new RegExp(`adminApiGuard\\('${expectedGroup}'\\)`, 'g')
    ) ?? [];

    assert.equal(guardCalls.length, mutationCount, file);
    assert.equal(routeSource.includes('adminApiGuard()'), false, file);
  }

  const authSource = source('lib/auth.ts');
  assert.ok(authSource.indexOf('if (!user)') < authSource.indexOf('rateLimitAdminPropertyImages('));
  assert.ok(authSource.indexOf('if (!admin)') < authSource.indexOf('rateLimitAdminPropertyImages('));
});
