import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, truncate } from '@/lib/utils';

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string | null;
    blog_categories?:
      | { name: string; slug: string }[]
      | { name: string; slug: string }
      | null;
  };
}

export function BlogCard({ post }: BlogCardProps) {
  const category = Array.isArray(post.blog_categories)
    ? post.blog_categories[0]
    : post.blog_categories;

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        {/* Featured image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {post.featured_image ? (
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-3xl font-bold text-muted-foreground/40">
                {post.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <CardContent className="flex h-full flex-col pt-5 pb-5">
          {/* Category + date */}
          <div className="mb-2 flex items-center justify-between gap-2">
            {category ? (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            ) : (
              <span />
            )}
            {post.published_at && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(post.published_at)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {truncate(post.excerpt, 160)}
            </p>
          )}

          {/* Read more */}
          <span className="mt-auto flex items-center gap-0.5 pt-4 text-sm font-medium text-primary group-hover:underline">
            Read Article
            <ChevronRight className="h-4 w-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
