'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BLOG_POST_STATUSES } from '@/lib/admin-schemas';

export interface BlogPostFormValues {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: string;
  featured_image: string;
  status: string;
  meta_title: string;
  meta_description: string;
}

const NO_CATEGORY = '__none__';

export const DEFAULT_BLOG_POST_VALUES: BlogPostFormValues = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  category_id: NO_CATEGORY,
  featured_image: '',
  status: 'draft',
  meta_title: '',
  meta_description: '',
};

export interface BlogPostCategoryOption {
  id: string;
  name: string;
}

interface BlogPostFormProps {
  mode: 'create' | 'edit';
  postId?: string;
  initialValues?: Partial<BlogPostFormValues>;
  categories: BlogPostCategoryOption[];
}

/** Sentinel used by the category select for "no category". */
export const BLOG_POST_NO_CATEGORY = NO_CATEGORY;

/**
 * Admin blog post create/edit form. Talks to /api/admin/blog-posts.
 */
export function BlogPostForm({ mode, postId, initialValues, categories }: BlogPostFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<BlogPostFormValues>({
    ...DEFAULT_BLOG_POST_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const setField = <K extends keyof BlogPostFormValues>(
    key: K,
    value: BlogPostFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    const clientErrors: Record<string, string[]> = {};
    if (values.title.trim().length < 3) clientErrors.title = ['Title must be at least 3 characters'];
    if (values.content.trim().length < 1) clientErrors.content = ['Content is required'];
    if (
      values.featured_image.trim() &&
      !/^https?:\/\/.+/.test(values.featured_image.trim())
    ) {
      clientErrors.featured_image = ['Enter a valid image URL'];
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setErrors({});

    const payload = {
      title: values.title,
      slug: values.slug,
      content: values.content,
      excerpt: values.excerpt,
      category_id: values.category_id === NO_CATEGORY ? '' : values.category_id,
      featured_image: values.featured_image,
      status: values.status,
      meta_title: values.meta_title,
      meta_description: values.meta_description,
    };

    startTransition(async () => {
      try {
        const response = await fetch(
          mode === 'create' ? '/api/admin/blog-posts' : `/api/admin/blog-posts/${postId}`,
          {
            method: mode === 'create' ? 'POST' : 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          if (body?.fieldErrors) setErrors(body.fieldErrors);
          throw new Error(body?.error ?? 'Something went wrong');
        }

        toast.success(mode === 'create' ? 'Blog post created' : 'Blog post saved');
        router.push('/admin/blog');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Something went wrong');
      }
    });
  };

  const fieldError = (key: string) =>
    errors[key]?.length ? <p className="text-xs text-destructive">{errors[key][0]}</p> : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Post Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="e.g. Buying Land in Lagos: A Complete Guide"
            />
            {fieldError('title')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={values.slug}
              onChange={(event) => setField('slug', event.target.value)}
              placeholder="Leave empty to generate from title"
            />
            {fieldError('slug')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" value={values.status} onValueChange={(value) => setField('status', value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOG_POST_STATUSES.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only published posts are visible on the public website.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category_id" value={values.category_id} onValueChange={(value) => setField('category_id', value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError('category_id')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="featured_image">Featured Image URL</Label>
            <Input
              id="featured_image"
              value={values.featured_image}
              onChange={(event) => setField('featured_image', event.target.value)}
              placeholder="https://..."
            />
            {fieldError('featured_image')}
            <p className="text-xs text-muted-foreground">
              Image uploads are not wired up yet — paste a hosted image URL.
            </p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              rows={3}
              value={values.excerpt}
              onChange={(event) => setField('excerpt', event.target.value)}
              placeholder="Short summary shown in listing pages and search results"
            />
            {fieldError('excerpt')}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              rows={14}
              value={values.content}
              onChange={(event) => setField('content', event.target.value)}
              placeholder="Full article content"
            />
            {fieldError('content')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              value={values.meta_title}
              onChange={(event) => setField('meta_title', event.target.value)}
              placeholder="Leave empty to use the post title"
            />
            {fieldError('meta_title')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              rows={3}
              value={values.meta_description}
              onChange={(event) => setField('meta_description', event.target.value)}
            />
            {fieldError('meta_description')}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Post' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/blog')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
