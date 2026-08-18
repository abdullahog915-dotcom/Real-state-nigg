import type { Metadata } from 'next';
import PropertiesPage from '@/app/properties/page';
import { buildPageMetadata } from '@/lib/seo';

interface TransactionPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ searchParams }: TransactionPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const hasTransientFilters = Object.entries(params).some(
    ([key, value]) => key !== 'page' && Boolean(value)
  );

  return buildPageMetadata({
    title: `Properties for Sale in Nigeria${page > 1 ? ` | Page ${page}` : ''}`,
    description:
      'Browse houses, apartments, land, and commercial properties for sale across Lagos, Abuja, Port Harcourt, and other Nigerian locations.',
    path: hasTransientFilters
      ? '/properties/buy'
      : `/properties/buy${page > 1 ? `?page=${page}` : ''}`,
    noIndex: hasTransientFilters,
  });
}

export default async function BuyPropertiesPage({ searchParams }: TransactionPageProps) {
  const params = await searchParams;
  return <PropertiesPage searchParams={Promise.resolve({ ...params, type: 'sale' })} />;
}
