'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  postCount: number;
}

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  display_order: string;
}

const EMPTY_FORM: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  display_order: '0',
};

/**
 * Admin blog category manager — create, edit and delete categories
 * through /api/admin/blog-categories.
 */
export function BlogCategoriesManager({ rows }: { rows: AdminCategoryRow[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const openEdit = (category: AdminCategoryRow) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      display_order: String(category.display_order),
    });
    setFieldErrors({});
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const clientErrors: Record<string, string[]> = {};
    if (form.name.trim().length < 2) clientErrors.name = ['Name must be at least 2 characters'];
    const displayOrder = Number(form.display_order || '0');
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      clientErrors.display_order = ['Enter a whole number'];
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setFieldErrors({});

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      display_order: displayOrder,
    };

    startTransition(async () => {
      try {
        const response = await fetch(
          editing ? `/api/admin/blog-categories/${editing.id}` : '/api/admin/blog-categories',
          {
            method: editing ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          if (body?.fieldErrors) setFieldErrors(body.fieldErrors);
          throw new Error(body?.error ?? 'Something went wrong');
        }

        toast.success(editing ? 'Category saved' : 'Category created');
        setDialogOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Something went wrong');
      }
    });
  };

  const handleDelete = (category: AdminCategoryRow) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"? Posts in this category remain but become uncategorised.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/blog-categories/${category.id}`, {
          method: 'DELETE',
        });
        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(body?.error ?? 'Something went wrong');
        }

        toast.success('Category deleted');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Something went wrong');
      }
    });
  };

  const fieldError = (key: string) =>
    fieldErrors[key]?.length ? (
      <p className="text-xs text-destructive">{fieldErrors[key][0]}</p>
    ) : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No categories yet. Create your first category using the button above.
        </p>
      ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Posts</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <span className="font-medium">{category.name}</span>
                {category.description && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">/{category.slug}</TableCell>
              <TableCell>{category.postCount}</TableCell>
              <TableCell>{category.display_order}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(category)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              Categories group blog posts on the public blog pages.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name *</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Market Insights"
              />
              {fieldError('name')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder="Leave empty to generate from name"
              />
              {fieldError('slug')}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-order">Display Order</Label>
              <Input
                id="category-order"
                type="number"
                min="0"
                value={form.display_order}
                onChange={(event) =>
                  setForm((current) => ({ ...current, display_order: event.target.value }))
                }
              />
              {fieldError('display_order')}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
