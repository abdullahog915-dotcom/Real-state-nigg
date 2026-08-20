import 'server-only';

import { cache } from 'react';
import { createPublicClient } from '@/lib/supabase/public';

export interface ResolvedSiteSettings {
  name: string;
  logoText: string;
  tagline: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  heroTitle: string;
  heroSubtitle: string;
  seoDescription: string;
  seoOgImage: string;
  organizationName: string;
  socials: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}

const CODE_FALLBACKS: ResolvedSiteSettings = {
  name: 'Nigerian Property Marketplace',
  logoText: 'NP',
  tagline: 'Find your next property in Nigeria',
  description: 'Discover properties for sale, rent, and short let across Nigeria.',
  logoUrl: '',
  faviconUrl: '',
  address: '',
  email: '',
  phone: '',
  whatsapp: '',
  heroTitle: 'Find Your Perfect Property in Nigeria',
  heroSubtitle: 'Explore homes, apartments, land, and commercial spaces with trusted local agents.',
  seoDescription: 'Discover properties for sale, rent, and short let across Nigeria.',
  seoOgImage: '',
  organizationName: 'Nigerian Property Marketplace',
  socials: { facebook: '', instagram: '', twitter: '', linkedin: '' },
};

// Exact values seeded by migration 015 are bootstrap examples, not owner choices.
// They remain in the database for migration stability but never override a real
// environment value until an administrator changes them.
const LEGACY_BOOTSTRAP_VALUES: Record<string, string> = {
  site_name: 'Premium Real Estate Nigeria',
  site_tagline: 'Find Your Dream Property in Nigeria',
  company_phone: '+234-803-123-4567',
  company_email: 'info@premiumrealestate.ng',
  company_address: '123 Victoria Island, Lagos, Nigeria',
  whatsapp_number: '2348031234567',
  meta_description: 'Find premium properties for sale and rent across Nigeria',
};

const SOCIAL_ENV: Record<keyof ResolvedSiteSettings['socials'], string | undefined> = {
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  twitter: process.env.NEXT_PUBLIC_TWITTER_URL,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL,
};

function environmentFallbacks(): ResolvedSiteSettings {
  const usable = (value: string | undefined, rejected: string[] = []) => {
    const candidate = value?.trim() ?? '';
    return rejected.includes(candidate) ? '' : candidate;
  };
  const name = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || CODE_FALLBACKS.name;
  const description =
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() || CODE_FALLBACKS.description;
  return {
    ...CODE_FALLBACKS,
    name,
    logoText: process.env.NEXT_PUBLIC_LOGO_TEXT?.trim() || CODE_FALLBACKS.logoText,
    tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE?.trim() || CODE_FALLBACKS.tagline,
    description,
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS?.trim() || '',
    email: usable(process.env.NEXT_PUBLIC_EMAIL, ['info@realestate.com', 'info@youragency.com']),
    phone: usable(process.env.NEXT_PUBLIC_PHONE_NUMBER, ['+234-XXX-XXX-XXXX']),
    whatsapp: usable(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, ['234XXXXXXXXXX']),
    seoDescription: description,
    organizationName: name,
    socials: {
      facebook: SOCIAL_ENV.facebook?.trim() || '',
      instagram: SOCIAL_ENV.instagram?.trim() || '',
      twitter: SOCIAL_ENV.twitter?.trim() || '',
      linkedin: SOCIAL_ENV.linkedin?.trim() || '',
    },
  };
}

function resolveSetting(
  rows: Map<string, string>,
  key: string,
  fallback: string
): string {
  if (!rows.has(key)) return fallback;
  const value = rows.get(key)?.trim() ?? '';
  if (LEGACY_BOOTSTRAP_VALUES[key] === value) return fallback;
  return value;
}

export const getSiteSettings = cache(async (): Promise<ResolvedSiteSettings> => {
  const fallback = environmentFallbacks();
  try {
    const supabase = createPublicClient();
    const [settingsResult, socialResult] = await Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase
        .from('social_links')
        .select('platform, url, is_active, display_order')
        .eq('is_active', true)
        .order('display_order'),
    ]);

    if (settingsResult.error || socialResult.error) {
      console.error('Public site settings could not be loaded.', {
        settings: settingsResult.error?.code ?? null,
        socials: socialResult.error?.code ?? null,
      });
      return fallback;
    }

    const settingsData = (settingsResult.data ?? []) as Array<{ key: string; value: string | null }>;
    const socialData = (socialResult.data ?? []) as Array<{
      platform: string; url: string; is_active: boolean; display_order: number;
    }>;
    const rows = new Map(settingsData.map((row) => [row.key, row.value ?? '']));
    const socials = { ...fallback.socials };
    for (const row of socialData) {
      if (!(row.platform in socials)) continue;
      // Ignore the exact sample handles inserted by migration 015.
      if (row.url.includes('premiumrealestate')) continue;
      socials[row.platform as keyof typeof socials] = row.url.trim();
    }

    const name = resolveSetting(rows, 'site_name', fallback.name);
    const description = resolveSetting(rows, 'site_description', fallback.description);
    return {
      name,
      logoText: resolveSetting(rows, 'logo_text', fallback.logoText),
      tagline: resolveSetting(rows, 'site_tagline', fallback.tagline),
      description,
      logoUrl: resolveSetting(rows, 'logo_url', ''),
      faviconUrl: resolveSetting(rows, 'favicon_url', ''),
      address: resolveSetting(rows, 'company_address', fallback.address),
      email: resolveSetting(rows, 'company_email', fallback.email),
      phone: resolveSetting(rows, 'company_phone', fallback.phone),
      whatsapp: resolveSetting(rows, 'whatsapp_number', fallback.whatsapp),
      heroTitle: resolveSetting(rows, 'hero_fallback_title', fallback.heroTitle),
      heroSubtitle: resolveSetting(rows, 'hero_fallback_subtitle', fallback.heroSubtitle),
      seoDescription: resolveSetting(
        rows,
        'seo_default_description',
        resolveSetting(rows, 'meta_description', fallback.seoDescription)
      ),
      seoOgImage: resolveSetting(rows, 'seo_og_image', ''),
      organizationName: resolveSetting(rows, 'organization_name', name),
      socials,
    };
  } catch (error) {
    console.error('Public site settings request failed.', {
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });
    return fallback;
  }
});
