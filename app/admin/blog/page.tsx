import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { StatusSelect } from '@/components/admin/StatusSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { BLOG_POST_STATUSES } from '@/lib/admin-schemas';
import { getAdminBlogPosts } from '@/lib/supabase/queries';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Blog Posts',
};

interface AdminBlogPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;

  const posts = await getAdminBlogPosts(search);

  return (
    <div>
      <AdminPageHeader
        title="Blog Posts"
        description={`${posts.length} post${posts.length === 1 ? '' : 's'} in total. Only published posts appear on the public website.`}
        actions={
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus className="h-4 w-4" /> Add Post
            </Link>
          </Button>
        }
      />

      <AdminFilterBar
        basePath="/admin/blog"
        searchValue={search}
        searchPlaceholder="Search by title..."
      />

      {posts.length === 0 ? (
        <EmptyState
          title="No blog posts found"
          description={
            search
              ? 'Try adjusting your search.'
              : 'Create your first blog post to get started.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const category = Array.isArray(post.blog_categories)
                    ? post.blog_categories[0]
                    : post.blog_categories;
                  return (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-[280px]">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="font-medium hover:underline"
                        >
                          <span className="line-clamp-1">{post.title}</span>
                        </Link>
                        <p className="text-xs text-muted-foreground">/{post.slug}</p>
                      </TableCell>
                      <TableCell className="max-w-[140px]">
                        {category ? (
                          <span className="line-clamp-1">{category.name}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusSelect
                          apiPath={`/api/admin/blog-posts/${post.id}`}
                          value={post.status ?? 'draft'}
                          options={[...BLOG_POST_STATUSES]}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {post.published_at ? formatDate(post.published_at) : '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(post.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/blog/${post.id}/edit`}>Edit</Link>
                          </Button>
                          <DeleteButton
                            apiPath={`/api/admin/blog-posts/${post.id}`}
                            confirmText={`Delete "${post.title}"? This permanently removes the post. Use the "archived" status instead to keep it hidden.`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
