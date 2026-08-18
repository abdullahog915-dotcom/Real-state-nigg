import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public';
import { absoluteUrl, publicImageUrl } from '@/lib/seo';

export const revalidate = 3600;

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/properties', changeFrequency: 'daily', priority: 0.9 },
  { path: '/properties/buy', changeFrequency: 'daily', priority: 0.9 },
  { path: '/properties/rent', changeFrequency: 'daily', priority: 0.9 },
  { path: '/properties/short-let', changeFrequency: 'daily', priority: 0.9 },
  { path: '/locations', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/agents', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

type SitemapProperty = { slug: string; updated_at: string; featured_image: string | null };
type SitemapAgent = { slug: string; updated_at: string; photo_url: string | null };
type SitemapLocation = { slug: string; updated_at: string };
type SitemapPost = {
  slug: string;
  updated_at: string;
  published_at: string | null;
  featured_image: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const [propertiesResult, agentsResult, locationsResult, postsResult] = await Promise.all([
    supabase
      .from('properties')
      .select('slug, updated_at, featured_image')
      .in('status', ['published', 'featured']),
    supabase
      .from('agents')
      .select('slug, updated_at, photo_url')
      .eq('is_active', true),
    supabase.from('locations').select('slug, updated_at'),
    supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at, featured_image')
      .eq('status', 'published'),
  ]);

  if (propertiesResult.error) {
    console.error('Sitemap properties query failed:', propertiesResult.error.message);
  }
  if (agentsResult.error) {
    console.error('Sitemap agents query failed:', agentsResult.error.message);
  }
  if (locationsResult.error) {
    console.error('Sitemap locations query failed:', locationsResult.error.message);
  }
  if (postsResult.error) {
    console.error('Sitemap blog query failed:', postsResult.error.message);
  }

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const properties = (propertiesResult.data ?? []) as unknown as SitemapProperty[];
  const agents = (agentsResult.data ?? []) as unknown as SitemapAgent[];
  const locations = (locationsResult.data ?? []) as unknown as SitemapLocation[];
  const posts = (postsResult.data ?? []) as unknown as SitemapPost[];

  const propertyEntries: MetadataRoute.Sitemap = properties.map((property) => {
    const image = publicImageUrl(property.featured_image);
    return {
      url: absoluteUrl(`/properties/${property.slug}`),
      lastModified: property.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
      ...(image ? { images: [image] } : {}),
    };
  });

  const agentEntries: MetadataRoute.Sitemap = agents.map((agent) => {
    const image = publicImageUrl(agent.photo_url);
    return {
      url: absoluteUrl(`/agents/${agent.slug}`),
      lastModified: agent.updated_at,
      changeFrequency: 'monthly',
      priority: 0.6,
      ...(image ? { images: [image] } : {}),
    };
  });

  const locationEntries: MetadataRoute.Sitemap = locations.map((location) => ({
    url: absoluteUrl(`/locations/${location.slug}`),
    lastModified: location.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const image = publicImageUrl(post.featured_image);
    return {
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updated_at || post.published_at || undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
      ...(image ? { images: [image] } : {}),
    };
  });

  return [
    ...staticEntries,
    ...propertyEntries,
    ...agentEntries,
    ...locationEntries,
    ...postEntries,
  ];
}
