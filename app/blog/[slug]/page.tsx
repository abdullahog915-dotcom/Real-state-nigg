import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BlogCard } from '@/components/blog/BlogCard';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { getBlogPostBySlug, getRelatedBlogPosts } from '@/lib/supabase/queries';
import { formatDate, truncate } from '@/lib/utils';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Article Not Found' };
  }

  const title = post.meta_title || post.title;
  const description = post.meta_description
    || (post.excerpt ? truncate(post.excerpt, 160) : truncate(post.content, 160));

  return {
    title: `${title} | Blog`,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      ...(post.featured_image ? { images: [{ url: post.featured_image }] } : {}),
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const category = Array.isArray(post.blog_categories)
    ? post.blog_categories[0]
    : post.blog_categories;

  const relatedPosts = await getRelatedBlogPosts(post.id, category?.id, 3);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-foreground">{truncate(post.title, 40)}</span>
          </nav>
        </div>
      </div>

      <article className="container mx-auto max-w-4xl px-4 py-8 lg:py-12">
        {/* Post header */}
        <header>
          <div className="flex flex-wrap items-center gap-3">
            {category && (
              <Button asChild variant="secondary" size="sm" className="rounded-full">
                <Link href={`/blog?category=${category.slug}`}>{category.name}</Link>
              </Button>
            )}
            {post.published_at && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Featured image */}
        {post.featured_image && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              unoptimized
              priority
            />
          </div>
        )}

        {/* Post content */}
        <Separator className="my-8" />
        <div className="whitespace-pre-line text-base leading-relaxed text-foreground/90">
          {post.content}
        </div>

        {/* Back to blog */}
        <div className="mt-10">
          <Button asChild variant="outline">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t bg-muted/20 py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <SectionHeading
              title="Related Articles"
              subtitle="More insights and guides you may find helpful"
            />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <BlogCard key={related.id} post={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
