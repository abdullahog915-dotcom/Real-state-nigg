import type { Metadata } from 'next';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  BlogCategoriesManager,
  type AdminCategoryRow,
} from '@/components/admin/BlogCategoriesManager';
import { Card, CardContent } from '@/components/ui/card';
import { getAdminBlogCategories } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Blog Categories',
};

export default async function AdminCategoriesPage() {
  const categories = await getAdminBlogCategories();

  const rows: AdminCategoryRow[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    display_order: category.display_order ?? 0,
    postCount: Array.isArray(category.blog_posts) ? category.blog_posts.length : 0,
  }));

  return (
    <div>
      <AdminPageHeader
        title="Blog Categories"
        description="Categories used to group blog posts. Deleting a category leaves its posts uncategorised."
      />

      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            <BlogCategoriesManager rows={rows} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
