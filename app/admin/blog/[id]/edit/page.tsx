import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  BLOG_POST_NO_CATEGORY,
  BlogPostForm,
  type BlogPostFormValues,
} from '@/components/admin/BlogPostForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { Button } from '@/components/ui/button';
import { getAdminBlogCategories, getAdminBlogPostById } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Edit Blog Post',
};

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;

  const [post, categories] = await Promise.all([
    getAdminBlogPostById(id),
    getAdminBlogCategories(),
  ]);

  if (!post) {
    notFound();
  }

  const initialValues: Partial<BlogPostFormValues> = {
    title: post.title ?? '',
    slug: post.slug ?? '',
    content: post.content ?? '',
    excerpt: post.excerpt ?? '',
    category_id: post.category_id ?? BLOG_POST_NO_CATEGORY,
    featured_image: post.featured_image ?? '',
    status: post.status ?? 'draft',
    meta_title: post.meta_title ?? '',
    meta_description: post.meta_description ?? '',
  };

  return (
    <div>
      <AdminPageHeader
        title="Edit Blog Post"
        description={post.title}
        actions={
          <>
            {post.status === 'published' && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4" /> View Public Page
                </Link>
              </Button>
            )}
            <DeleteButton
              apiPath={`/api/admin/blog-posts/${post.id}`}
              confirmText={`Delete "${post.title}"? This permanently removes the post. Use the "archived" status instead to keep it hidden.`}
              label="Delete"
              redirectTo="/admin/blog"
            />
          </>
        }
      />
      <BlogPostForm
        mode="edit"
        postId={post.id}
        initialValues={initialValues}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}
