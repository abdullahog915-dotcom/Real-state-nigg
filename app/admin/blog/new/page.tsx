import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BlogPostForm } from '@/components/admin/BlogPostForm';
import { getAdminBlogCategories } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Add Blog Post',
};

export default async function NewBlogPostPage() {
  const categories = await getAdminBlogCategories();

  return (
    <div>
      <AdminPageHeader
        title="Add Blog Post"
        description="Create a new article. Only published posts appear on the public website."
      />
      <BlogPostForm
        mode="create"
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}
