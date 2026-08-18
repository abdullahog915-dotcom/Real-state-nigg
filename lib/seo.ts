import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

const LOCAL_SITE_URL = 'http://localhost:3000';

export function getSiteUrl(): URL {
  try {
    const url = new URL(SITE_CONFIG.url);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url
      : new URL(LOCAL_SITE_URL);
  } catch {
    return new URL(LOCAL_SITE_URL);
  }
}

export function absoluteUrl(path = '/'): string {
  return new URL(path, getSiteUrl()).toString();
}

export function publicImageUrl(value?: string | null): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value, getSiteUrl());
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function toMetaDescription(value: string, maxLength = 160): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  absoluteTitle?: boolean;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string | null;
  modifiedTime?: string | null;
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  absoluteTitle = false,
  noIndex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = publicImageUrl(image);
  const socialTitle = absoluteTitle ? title : `${title} | ${SITE_CONFIG.name}`;
  const images = socialImage ? [{ url: socialImage, alt: title }] : undefined;

  const openGraph: Metadata['openGraph'] = type === 'article'
    ? {
        type: 'article',
        locale: 'en_NG',
        siteName: SITE_CONFIG.name,
        url: canonical,
        title: socialTitle,
        description,
        ...(images ? { images } : {}),
        ...(publishedTime ? { publishedTime } : {}),
        ...(modifiedTime ? { modifiedTime } : {}),
      }
    : {
        type: 'website',
        locale: 'en_NG',
        siteName: SITE_CONFIG.name,
        url: canonical,
        title: socialTitle,
        description,
        ...(images ? { images } : {}),
      };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph,
    twitter: {
      card: socialImage ? 'summary_large_image' : 'summary',
      title: socialTitle,
      description,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: true,
            googleBot: { index: false, follow: true },
          },
        }
      : {}),
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationJsonLd() {
  const configuredPhone = process.env.NEXT_PUBLIC_PHONE_NUMBER;
  const configuredEmail = process.env.NEXT_PUBLIC_EMAIL;

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${absoluteUrl('/')}#organization`,
    name: SITE_CONFIG.name,
    url: absoluteUrl('/'),
    description: SITE_CONFIG.description,
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    ...(configuredPhone ? { telephone: configuredPhone } : {}),
    ...(configuredEmail ? { email: configuredEmail } : {}),
  };
}
