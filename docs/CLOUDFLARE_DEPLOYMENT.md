# Cloudflare Workers Production Runbook

Last reviewed: 2026-08-19

This runbook prepares Phase 9 without deploying, changing DNS, enabling HSTS, or modifying Supabase. The application target is a Cloudflare Worker produced by `@opennextjs/cloudflare`; it is not a Cloudflare Pages static deployment.

## 1. Architecture

- Next.js 16.3 App Router and route handlers run in one Cloudflare Worker.
- OpenNext creates `.open-next/worker.js` and `.open-next/assets`.
- Wrangler reads `wrangler.jsonc`; `nodejs_compat` and `global_fetch_strictly_public` are enabled.
- Immutable Next.js assets receive a one-year cache header through `public/_headers`.
- Supabase remains the managed PostgreSQL, Auth, and Storage provider. Browser/session operations use the public anon key plus the user's session. Only the three public lead API routes use a separate server-only Supabase secret client for trusted inserts after rate limiting, validation, and Turnstile.
- `middleware.ts` intentionally remains. Next.js 16 `proxy.ts` always uses the Node runtime, but OpenNext 1.20.2 does not support Node middleware. The deprecated Edge middleware still builds and preserves the request-boundary admin, favorites, Origin/CSRF, cookie-refresh, and body-size controls. Revisit only after OpenNext adds Node middleware support.
- R2 incremental caching is not configured. Provisioning a bucket is an owner-approved infrastructure change and is unnecessary for the current dynamic, session-aware pages.

## 2. Required environment variables

Set production values in both Cloudflare **Build variables and secrets** and Worker **Variables and Secrets** when using Workers Builds. `NEXT_PUBLIC_*` values must exist at build time because Next.js embeds them into browser bundles. Runtime server code also requires the Supabase variables and Turnstile settings. CLI deployments use `--keep-vars` so dashboard values are not erased.

Public values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` - exact canonical HTTPS origin, with no path or trailing preview hostname
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_DESCRIPTION`
- `NEXT_PUBLIC_SITE_TAGLINE`
- `NEXT_PUBLIC_BUSINESS_ADDRESS`
- `NEXT_PUBLIC_LOGO_TEXT`
- `NEXT_PUBLIC_PHONE_NUMBER`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_EMAIL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Optional social, Maps, analytics, and pixel values shown in `.env.example`

Server-only values:

- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_ALLOWED_HOSTNAMES` - comma-separated hostnames, without schemes or paths; include the custom domain and only intentional preview hostname(s)
- `SUPABASE_SECRET_KEY` - a dedicated modern Supabase `sb_secret_...` key stored only as a Cloudflare Worker Secret; used exclusively by contact/inquiry/viewing insertion code

The Supabase secret maps to elevated `service_role` database access and bypasses RLS. Never expose it to browser code, prefix it with `NEXT_PUBLIC_`, return it from an API, or write it to logs. Prefer a dedicated modern secret key over the legacy JWT `SUPABASE_SERVICE_ROLE_KEY`, and rotate it independently if exposure is suspected. Do not store secret values in `wrangler.jsonc`, Git, build logs, or tracked environment files.

For local testing, use Cloudflare's published always-pass test site key `1x00000000000000000000AA` and test secret `1x0000000000000000000000000000000AA` in ignored `.env.local`. When no Turnstile site key/secret is configured, local development remains usable. A production Worker with no secret fails public-form verification closed.

## 3. Production identity owner checklist

Do not deploy with the defaults in `.env.example`. The owner must provide:

- legal/trading business name, short logo text or a final logo asset, description, and tagline;
- canonical apex or `www` hostname;
- public business address, phone, WhatsApp number, and support email;
- real Facebook, Instagram, X/Twitter, and LinkedIn URLs if they should appear;
- final analytics identifiers, if used.

The Navbar, Footer, metadata, JSON-LD, canonical links, sitemap, robots host, Open Graph data, and auth callback now derive from centralized environment-backed configuration. Blank social URLs and a blank address are omitted rather than rendered as fake links or an invented address.

## 4. Supabase Auth configuration

In Supabase Dashboard, make these owner-approved changes immediately before preview/production validation:

1. Authentication > URL Configuration:
   - Site URL: `https://<canonical-host>`
   - Redirect URL: `https://<canonical-host>/auth/callback`
   - Add `https://<intentional-preview-host>/auth/callback` only for a controlled preview. Remove it when no longer needed.
2. Avoid broad wildcard production redirects. There is no OAuth provider or password-reset route in the current application, so no additional callback is required.
3. Authentication > Bot and Abuse Protection: enable Cloudflare Turnstile and enter the same widget secret used for the production widget. Login/signup send the browser token directly to Supabase Auth for verification.
4. Review Supabase Auth rate limits and email confirmation settings. Cloudflare WAF rules cannot govern direct browser-to-Supabase Auth requests.

The callback sanitizes `next` to an internal path, and admin authorization remains enforced in middleware, the admin layout/API guards, and database RLS.

## 5. Turnstile behavior

Turnstile widgets are present on signup, login, contact, inquiry, and viewing forms when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set.

- Contact/inquiry/viewing tokens are checked server-side against Cloudflare Siteverify before any database query or insert.
- The server requires the expected action and an allowed hostname, uses the Cloudflare client IP when available, enforces the documented token length, uses a five-second timeout, and returns only generic public errors.
- Tokens are reset after failed submissions because tokens are single-use and expire.
- Login/signup pass `captchaToken` to Supabase Auth; Supabase must have CAPTCHA enabled for these tokens to be enforced.
- Once reviewed and manually applied, migration 020 closes direct anon/authenticated Data API inserts into contact submissions, inquiries, and viewing requests. Legitimate inserts go through the Worker routes and their isolated server-only writer. RLS remains enabled, browser `INSERT` privileges are revoked, and insert triggers preserve the property/state/field checks from migration 019.
- Roll out without an ingestion gap: configure `SUPABASE_SECRET_KEY`, deploy the trusted-writer Worker, verify all three forms, and only then apply migration 020. The migration is never applied by the application build or deploy scripts.

## 6. Distributed rate limiting

Do not use an in-memory limiter in the Worker. Configure these Cloudflare WAF Rate Limiting Rules on the custom domain after the preview is stable. Use IP as the edge characteristic, return `429`, add a short `Retry-After` where the product permits it, and begin in log/challenge mode if the plan supports it.

| Rule | Exact expression | Threshold | Suggested action |
| --- | --- | ---: | --- |
| Contact | `http.request.method eq "POST" and http.request.uri.path eq "/api/contact"` | 5/hour/IP | Block 1 hour |
| Inquiry | `http.request.method eq "POST" and http.request.uri.path eq "/api/inquiries"` | 5/hour/IP | Block 1 hour |
| Viewing | `http.request.method eq "POST" and http.request.uri.path eq "/api/viewing-requests"` | 5/hour/IP | Block 1 hour |
| Upload | `http.request.method eq "POST" and http.request.uri.path eq "/api/admin/property-images"` | 30/hour/IP | Block 1 hour |
| Favorites | `http.request.method in {"POST" "DELETE"} and http.request.uri.path eq "/api/favorites"` | 60/minute/IP | Block 10 minutes |
| Other admin mutations | `http.request.method in {"POST" "PUT" "PATCH" "DELETE"} and starts_with(http.request.uri.path, "/api/admin/") and http.request.uri.path ne "/api/admin/property-images"` | 120/minute/IP | Block 10 minutes |

Cloudflare plan capabilities may limit counting periods, rule count, or mitigation actions. Where a one-hour window is unavailable, use the closest stricter supported edge rule or a Cloudflare Rate Limiting binding/Durable Object designed with an authenticated user key. The listed upload/favorite/admin WAF rules are IP backstops, not exact per-user counters; the application authenticates the request after the edge. Do not claim any rule is active until it appears in Cloudflare and a controlled over-limit request returns `429`.

## 7. Domain, TLS, headers, and indexing

1. Choose either apex or `www` as canonical; set `NEXT_PUBLIC_SITE_URL` to it.
2. Attach the custom domain to the Worker, use proxied DNS, and set SSL/TLS to Full (strict) after the origin/certificate state is valid.
3. Redirect the non-canonical hostname to the canonical hostname at Cloudflare. Do not point canonical metadata at `workers.dev`.
4. Protect preview URLs with Cloudflare Access or disable their public route after validation. Production metadata should continue to name the final custom domain.
5. Existing application headers include CSP `base-uri`, `object-src`, and `frame-ancestors`, plus `X-Frame-Options`, MIME sniffing protection, strict-origin referrer policy, and a restrictive Permissions Policy. The partial CSP does not block Turnstile scripts/frames.
6. Do not enable HSTS on a preview hostname. After the canonical HTTPS host and all required subdomains are stable, start conservatively with `Strict-Transport-Security: max-age=86400`; extend later only after monitoring. Add `includeSubDomains` or preload only after a separate domain-wide review.

## 8. Images and caching

- Keep `images.unoptimized: true`. Existing Supabase public Storage URLs remain unchanged and no Vercel image service is assumed.
- Immutable `/_next/static/*` assets are browser/edge-cacheable for one year. Cloudflare compression can operate normally.
- Do not create a blanket Cache Everything rule. Bypass `/admin*`, `/api*`, `/auth*`, `/favorites*`, responses with authentication cookies, and all mutations.
- Public page HTML remains dynamic because shared navigation/favorite state reads cookies. This prevents cross-user cache leakage and keeps admin-edited property data fresh.
- `/sitemap.xml` is the only application-data response with an explicit one-hour revalidation period. `robots.txt` is static.
- Supabase controls public media caching. Verify object `Cache-Control`, CORS, and real image delivery from the production hostname. Cloudflare Images/Image Resizing is optional and requires a separately approved URL/transform strategy.

## 9. Build, preview, and production procedure

Safe local validation (no account mutation):

```bash
npm ci
npx tsc --noEmit
npm run lint
npm run build
npm run build:cloudflare
npx wrangler deploy --dry-run
```

Local Worker-runtime preview (still no Cloudflare deployment):

```bash
copy .dev.vars.example .dev.vars
npm run preview
```

Use WSL/Linux for final build parity because OpenNext warns that Windows support is incomplete.

Owner-approved remote preview:

1. Authenticate Wrangler with the intended account: `npx wrangler login`.
2. Configure build/runtime public variables and runtime secrets in Cloudflare; create the Turnstile widget first. Add `SUPABASE_SECRET_KEY` as an encrypted Worker Secret before deploying the trusted lead-writer code.
3. Run `npm run upload` to upload a version without immediately routing production traffic, or use a dedicated preview Worker name/configuration.
4. Test the full public/auth/private/admin/storage matrix on the preview URL. Do not use real production form volume.
5. After explicit approval, run `npm run deploy`. This preserves dashboard variables through `--keep-vars`.
6. Attach the custom domain and redirect the alternate hostname only after preview acceptance.

This repository preparation does not execute `preview`, `upload`, `deploy`, DNS, HSTS, or Supabase Dashboard changes.

## 10. Production validation matrix

Verify on the actual canonical host:

- Public: `/`, `/properties`, one property, `/agents`, `/locations`, `/blog`, one article, `/contact`, `/sitemap.xml`, `/robots.txt`.
- Auth: signup, confirmation callback, login, logout, safe internal redirects, and generic failure messages.
- Private: anonymous `/favorites` and `/admin` redirects; customer favorites ownership.
- Admin: dashboard, property CRUD, image upload/delete, blog CRUD, inquiry/viewing/contact visibility.
- Forms: successful and invalid contact/inquiry/viewing requests, expired/replayed Turnstile tokens, and active rate-limit `429` behavior.
- Storage: existing objects, valid JPEG/PNG/WebP upload, MIME/signature/size failures, cover/gallery behavior, and deletion.
- SEO: no localhost/preview canonical, correct metadata/JSON-LD, private noindex/disallow behavior.
- Headers/logs: all security headers, generic public errors, no stack traces, secrets, tokens, or Supabase internals.
- Performance: TTFB/LCP/CLS at 390 px and 1440 px; collect INP only from controlled interaction tests or real traffic. Do not call local lab data field Core Web Vitals.

## 11. Backup and rollback

- Record the deployment Git commit and confirm `supabase migration list --linked` matches the intended reviewed state before and after manually applying migration 020.
- Keep the previous healthy Cloudflare Worker version/deployment. After migration 020 is applied, do not roll back to an older Worker that inserts leads with the anon client because those writes will correctly fail. Roll back only to a version containing the trusted lead writer; do not reverse database migrations destructively.
- Supabase recovery uses platform backups/PITR according to the project's plan. Migration 019 is additive hardening and remains applied during an application rollback unless a separately reviewed forward migration is required.
- If Turnstile causes a production incident, first verify keys/hostnames and Supabase CAPTCHA settings. A temporary owner-approved rollback should restore the previous Worker version; never expose a secret or introduce service-role access as a shortcut.
