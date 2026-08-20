import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { after, before, test } from 'node:test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { bannerInputSchema, mp4UrlSchema, parseBannerCtaUrl } from '../lib/banner-validation.ts';
import { shouldRenderBannerVideo } from '../lib/banner-playback.ts';
import {
  apiBodyLimitForPath,
  contentLengthExceedsLimit,
  DEFAULT_API_BODY_LIMIT,
  PROPERTY_IMAGE_REQUEST_LIMIT,
  SITE_ASSET_API_BODY_LIMIT,
} from '../lib/api-request-size.ts';
import {
  brandingSettingsSchema,
  contactSettingsSchema,
  socialSettingsSchema,
} from '../lib/site-settings-schema.ts';
import {
  createSiteAssetPath,
  getManagedSiteAssetPath,
  getSiteAssetPublicUrl,
  hasValidSiteAssetSignature,
  hasValidMp4Structure,
  hasMp4FileExtension,
  isManagedSiteAssetPath,
  isSiteAssetSizeAllowed,
  siteAssetMaxBytes,
} from '../lib/site-asset-storage.ts';

const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const origin = 'https://phase10-test.supabase.co';
before(() => { process.env.NEXT_PUBLIC_SUPABASE_URL = origin; });
after(() => {
  if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
});

test('banner CTA validation accepts safe internal and HTTP(S) destinations', () => {
  assert.deepEqual(parseBannerCtaUrl('/properties/rent'), { kind: 'internal', href: '/properties/rent' });
  assert.equal(parseBannerCtaUrl('https://example.com/listings')?.kind, 'external');
  for (const unsafe of ['javascript:alert(1)', 'data:text/html,test', '//evil.example', '/\\evil.example']) {
    assert.equal(parseBannerCtaUrl(unsafe), null);
  }
});

test('banner validation enforces CTA pairs and numeric bounds', () => {
  const base = { title: 'Lagos homes', subtitle: 'Explore verified listings today',
    desktop_image_url: 'https://images.example/banner.webp', image_alt: 'Modern home in Lagos',
    overlay_strength: 45, is_active: true, display_order: 10 };
  assert.equal(bannerInputSchema.safeParse(base).success, true);
  assert.equal(bannerInputSchema.safeParse({ ...base, cta_label: 'Browse' }).success, false);
  assert.equal(bannerInputSchema.safeParse({ ...base, overlay_strength: 91 }).success, false);
});

test('legacy image inputs remain compatible and unsafe media combinations fail', () => {
  const legacyImage = {
    title: 'Lagos homes', subtitle: 'Explore verified listings today',
    desktop_image_url: 'https://images.example/banner.webp', image_alt: 'Modern home in Lagos',
    overlay_strength: 45, is_active: true, display_order: 10,
  };
  const parsedLegacy = bannerInputSchema.safeParse(legacyImage);
  assert.equal(parsedLegacy.success, true);
  assert.equal(parsedLegacy.data.media_type, 'image');

  const video = {
    ...legacyImage,
    media_type: 'video',
    desktop_image_url: '',
    desktop_video_url: 'https://media.example/hero.mp4',
    mobile_video_url: 'https://media.example/hero-mobile.mp4',
    poster_image_url: 'https://media.example/poster.webp',
  };
  assert.equal(bannerInputSchema.safeParse(video).success, true);
  assert.equal(bannerInputSchema.safeParse({ ...video, desktop_image_url: legacyImage.desktop_image_url }).success, false);
  assert.equal(bannerInputSchema.safeParse({ ...legacyImage, desktop_video_url: video.desktop_video_url }).success, false);
  assert.equal(bannerInputSchema.safeParse({ ...video, desktop_video_url: 'https://media.example/hero.webm' }).success, false);
});

test('MP4 URLs and generated video paths are strictly scoped', () => {
  assert.equal(mp4UrlSchema.safeParse('https://media.example/banner.mp4').success, true);
  assert.equal(mp4UrlSchema.safeParse('https://media.example/banner.MP4?version=2').success, true);
  assert.equal(mp4UrlSchema.safeParse('https://media.example/banner.webm').success, false);
  assert.equal(hasMp4FileExtension('homepage.MP4'), true);
  assert.equal(hasMp4FileExtension('homepage.mp4.exe'), false);
  assert.equal(siteAssetMaxBytes('banner-desktop-video'), 25 * 1024 * 1024);
  assert.equal(siteAssetMaxBytes('banner-mobile-video'), 15 * 1024 * 1024);
  assert.equal(siteAssetMaxBytes('banner-poster'), 5 * 1024 * 1024);
  assert.equal(isSiteAssetSizeAllowed('banner-desktop-video', 25 * 1024 * 1024), true);
  assert.equal(isSiteAssetSizeAllowed('banner-desktop-video', 25 * 1024 * 1024 + 1), false);
  assert.equal(isSiteAssetSizeAllowed('banner-mobile-video', 15 * 1024 * 1024), true);
  assert.equal(isSiteAssetSizeAllowed('banner-mobile-video', 15 * 1024 * 1024 + 1), false);
  assert.equal(isSiteAssetSizeAllowed('banner-poster', 5 * 1024 * 1024), true);
  assert.equal(isSiteAssetSizeAllowed('banner-poster', 5 * 1024 * 1024 + 1), false);
  for (const purpose of ['banner-desktop-video', 'banner-mobile-video']) {
    const path = createSiteAssetPath(purpose, 'video/mp4');
    assert.match(path, /^homepage\/banners\/[0-9a-f-]+\/video\/[0-9a-f-]+\.mp4$/);
    assert.equal(isManagedSiteAssetPath(path), true);
    assert.equal(getManagedSiteAssetPath(getSiteAssetPublicUrl(path)), path);
  }
});

test('site asset uploads have a scoped multipart envelope without widening other APIs', () => {
  assert.equal(SITE_ASSET_API_BODY_LIMIT, 32 * 1024 * 1024);
  assert.equal(apiBodyLimitForPath('/api/admin/site-assets'), SITE_ASSET_API_BODY_LIMIT);
  assert.equal(apiBodyLimitForPath('/api/contact'), DEFAULT_API_BODY_LIMIT);
  assert.equal(apiBodyLimitForPath('/api/admin/property-images'), PROPERTY_IMAGE_REQUEST_LIMIT);
  assert.equal(PROPERTY_IMAGE_REQUEST_LIMIT, 52 * 1024 * 1024);

  assert.equal(
    contentLengthExceedsLimit(new Headers({ 'content-length': String(8 * 1024 * 1024) }), SITE_ASSET_API_BODY_LIMIT),
    false
  );
  assert.equal(
    contentLengthExceedsLimit(new Headers({ 'content-length': String(SITE_ASSET_API_BODY_LIMIT + 1) }), SITE_ASSET_API_BODY_LIMIT),
    true
  );
  assert.equal(
    contentLengthExceedsLimit(new Headers(), SITE_ASSET_API_BODY_LIMIT),
    false
  );
});

test('site asset transport guards return the generic 413 and Next forwards the full envelope', () => {
  const middleware = readFileSync(new URL('../lib/supabase/middleware.ts', import.meta.url), 'utf8');
  const route = readFileSync(new URL('../app/api/admin/site-assets/route.ts', import.meta.url), 'utf8');
  const nextConfig = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');

  assert.match(middleware, /apiBodyLimitForPath\(request\.nextUrl\.pathname\)/);
  assert.match(middleware, /Request body too large\./);
  assert.match(route, /contentLengthExceedsLimit\(request\.headers, SITE_ASSET_API_BODY_LIMIT\)/);
  assert.match(route, /assetError\('Request body too large\.', 413\)/);
  assert.match(nextConfig, /proxyClientMaxBodySize:\s*SITE_ASSET_API_BODY_LIMIT/);
});

test('first-party JSX form controls expose a stable id or meaningful name', () => {
  const componentRoot = fileURLToPath(new URL('../components/', import.meta.url));
  const files = [];
  const visitDirectory = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) visitDirectory(entryPath);
      else if (entry.name.endsWith('.tsx')) files.push(entryPath);
    }
  };
  visitDirectory(componentRoot);

  const formTags = new Set(['input', 'Input', 'select', 'Select', 'textarea', 'Textarea']);
  const missing = [];
  for (const file of files) {
    if (file.includes(`${join('components', 'ui')}`)) continue;
    const sourceText = readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visitNode = (node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(sourceFile);
        if (formTags.has(tag)) {
          const attributes = new Set(
            node.attributes.properties
              .filter(ts.isJsxAttribute)
              .map((attribute) => attribute.name.text)
          );
          if (!attributes.has('id') && !attributes.has('name')) {
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
            missing.push(`${file}:${line} <${tag}>`);
          }
        }
      }
      ts.forEachChild(node, visitNode);
    };
    visitNode(sourceFile);
  }

  assert.deepEqual(missing, []);
});

test('CSP stays free of unsafe-eval and the next-themes compatibility helper stays ordered', () => {
  const nextConfig = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');
  const themeProvider = readFileSync(new URL('../components/theme/ThemeProvider.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(nextConfig, /unsafe-eval/);
  assert.match(themeProvider, /typeof globalThis\.__name !== 'function'/);
  assert.ok(themeProvider.indexOf('<script') < themeProvider.indexOf('<NextThemesProvider'));
});

test('migration 022 is additive, defaults legacy rows to image, and updates the existing bucket', () => {
  const sql = readFileSync(new URL('../supabase/migrations/022_banner_video_support.sql', import.meta.url), 'utf8');
  assert.match(sql, /media_type TEXT NOT NULL DEFAULT 'image'/i);
  assert.match(sql, /ALTER COLUMN desktop_image_url DROP NOT NULL/i);
  assert.match(sql, /WHERE id = 'site-assets'/i);
  assert.match(sql, /'video\/mp4'/i);
  assert.doesNotMatch(sql, /\b(?:DROP TABLE|TRUNCATE|DELETE FROM)\b/i);
  assert.doesNotMatch(sql, /DISABLE ROW LEVEL SECURITY/i);
});

test('MP4 structure validation requires bounded ftyp, moov, and mdat boxes', () => {
  const box = (type, payload = []) => {
    const size = 8 + payload.length;
    return [size >>> 24, size >>> 16 & 255, size >>> 8 & 255, size & 255,
      ...new TextEncoder().encode(type), ...payload];
  };
  const valid = new Uint8Array([
    ...box('ftyp', [...new TextEncoder().encode('isom'), 0, 0, 0, 0, ...new TextEncoder().encode('mp42')]),
    ...box('moov'),
    ...box('mdat', [0]),
  ]);
  assert.equal(hasValidMp4Structure(valid), true);
  assert.equal(hasValidSiteAssetSignature(valid, 'video/mp4'), true);
  assert.equal(hasValidMp4Structure(new Uint8Array([...box('ftyp', [...new TextEncoder().encode('isom'), 0, 0, 0, 0]), ...box('mdat')])), false);
  assert.equal(hasValidMp4Structure(new TextEncoder().encode('<video>not mp4</video>')), false);
});

test('reduced motion and failed playback always choose a static video fallback', () => {
  assert.equal(shouldRenderBannerVideo({ mediaType: 'video', reducedMotion: false, failed: false }), true);
  assert.equal(shouldRenderBannerVideo({ mediaType: 'video', reducedMotion: true, failed: false }), false);
  assert.equal(shouldRenderBannerVideo({ mediaType: 'video', reducedMotion: false, failed: true }), false);
  assert.equal(shouldRenderBannerVideo({ mediaType: 'image', reducedMotion: false, failed: false }), false);
});

test('settings schemas accept intentional blanks but reject unsafe public values', () => {
  assert.equal(brandingSettingsSchema.safeParse({ site_name: 'Prime Nest Nigeria', logo_text: 'PN',
    site_tagline: 'Find your place', site_description: 'A trusted Nigerian property marketplace for buyers and renters.',
    logo_url: '', favicon_url: '' }).success, true);
  assert.equal(contactSettingsSchema.safeParse({ company_address: '', company_email: '', company_phone: '', whatsapp_number: '' }).success, true);
  assert.equal(socialSettingsSchema.safeParse({ facebook: 'javascript:alert(1)', instagram: '', twitter: '', linkedin: '' }).success, false);
});

test('site asset paths are server-generated, canonical, and bucket-scoped', () => {
  for (const purpose of ['logo', 'favicon', 'banner-desktop', 'banner-mobile', 'banner-poster']) {
    const path = createSiteAssetPath(purpose, 'image/webp');
    assert.equal(isManagedSiteAssetPath(path), true);
    const url = getSiteAssetPublicUrl(path);
    assert.ok(url?.startsWith(`${origin}/storage/v1/object/public/site-assets/`));
    assert.equal(getManagedSiteAssetPath(url), path);
  }
  assert.equal(isManagedSiteAssetPath('../branding/logo/evil.webp'), false);
  assert.equal(getManagedSiteAssetPath('https://evil.example/storage/v1/object/public/site-assets/branding/logo/file.webp'), null);
});

test('site asset binary validation rejects extension-only spoofing', () => {
  const fake = new TextEncoder().encode('<script>alert(1)</script>');
  assert.equal(hasValidSiteAssetSignature(fake, 'image/jpeg'), false);
  assert.equal(hasValidSiteAssetSignature(fake, 'image/png'), false);
  assert.equal(hasValidSiteAssetSignature(fake, 'image/webp'), false);
});
