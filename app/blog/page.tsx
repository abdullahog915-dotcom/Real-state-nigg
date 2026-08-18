import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogCard } from '@/components/blog/BlogCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { Separator } from '@/components/ui/separator';
import { getBlogPosts, getBlogCategories } from '@/lib/supabase/queries';
import { cn } from '@/lib/utils';
import { buildPageMetadata } from '@/lib/seo';

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const categorySlug = params.category?.trim();
  const categories = categorySlug ? await getBlogCategories() : [];
  const category = categories.find((item) => item.slug === categorySlug);

  if (categorySlug && !category) {
    return buildPageMetadata({
      title: 'Blog Category Not Found',
      description: 'Browse Nigerian real estate insights, market updates, and property guides.',
      path: '/blog',
      noIndex: true,
    });
  }

  const pathParams = new URLSearchParams();
  if (category) pathParams.set('category', category.slug);
  if (page > 1) pathParams.set('page', String(page));
  const canonical = `/blog${pathParams.size ? `?${pathParams.toString()}` : ''}`;
  const title = category
    ? `${category.name} | Nigerian Real Estate Blog${page > 1 ? ` | Page ${page}` : ''}`
    : `Real Estate Insights & Guides${page > 1 ? ` | Page ${page}` : ''}`;
  const description = category?.description
    || 'Read market updates and practical guides on buying, renting, and short-letting property across Nigeria.';

  return buildPageMetadata({ title, description, path: canonical });
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;

  const pageParam = parseInt(params.page || '1', 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const categorySlug = params.category?.trim() || undefined;

  // Fetch posts and categories in parallel
  const [result, categories] = await Promise.all([
    getBlogPosts({ category: categorySlug, page, per_page: 9 }),
    getBlogCategories(),
  ]);

  const { data: posts, count, totalPages } = result;
  const activeCategory = categories.find((c) => c.slug === categorySlug);

  // Build pagination URLs that preserve the category filter
  function buildPageUrl(targetPage: number) {
    const urlParams = new URLSearchParams();
    if (categorySlug) urlParams.set('category', categorySlug);
    if (targetPage > 1) urlParams.set('page', String(targetPage));
    const qs = urlParams.toString();
    return `/blog${qs ? `?${qs}` : ''}`;
  }

  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Blog &amp; Insights
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Market updates, neighbourhood guides, and practical advice for buying,
            renting, and short-letting property in Nigeria.
          </p>

          {/* Result count */}
          <div className="mt-4 text-sm text-muted-foreground">
            {count > 0 ? (
              <p>
                <span className="font-semibold text-foreground">{count}</span>{' '}
                {count === 1 ? 'article' : 'articles'}
                {activeCategory ? ` in ${activeCategory.name}` : ''}
              </p>
            ) : (
              <p>{activeCategory ? `No articles in ${activeCategory.name} yet` : 'No articles published yet'}</p>
            )}
          </div>

          {/* Category filter chips */}
          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/blog"
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm transition-colors',
                  !categorySlug
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-background hover:bg-muted'
                )}
              >
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm transition-colors',
                    categorySlug === category.slug
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-muted'
                  )}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Post grid */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10">
                  <Separator className="mb-8" />
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    buildPageUrl={buildPageUrl}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title={activeCategory ? 'No Articles in This Category Yet' : 'No Articles Published Yet'}
              description={
                activeCategory
                  ? 'Check back soon for new articles in this category, or browse all posts.'
                  : 'Our blog is coming soon with market updates and property guides. In the meantime, browse our available properties.'
              }
              icon="search"
              action={
                activeCategory
                  ? { label: 'View All Articles', href: '/blog' }
                  : { label: 'Browse Properties', href: '/properties' }
              }
            />
          )}
        </div>
      </section>
    </>
  );
}
