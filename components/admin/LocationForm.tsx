'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export interface LocationFormValues {
  name: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  description: string;
  is_featured: boolean;
  display_order: string;
}

export const DEFAULT_LOCATION_VALUES: LocationFormValues = {
  name: '',
  slug: '',
  city: '',
  state: '',
  country: 'Nigeria',
  description: '',
  is_featured: false,
  display_order: '0',
};

interface LocationFormProps {
  mode: 'create' | 'edit';
  locationId?: string;
  initialValues?: Partial<LocationFormValues>;
}

/**
 * Admin location create/edit form. Talks to /api/admin/locations.
 */
export function LocationForm({ mode, locationId, initialValues }: LocationFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<LocationFormValues>({
    ...DEFAULT_LOCATION_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const setField = <K extends keyof LocationFormValues>(
    key: K,
    value: LocationFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    const clientErrors: Record<string, string[]> = {};
    if (values.name.trim().length < 2) clientErrors.name = ['Name must be at least 2 characters'];
    if (values.city.trim().length < 2) clientErrors.city = ['City must be at least 2 characters'];
    if (values.state.trim().length < 2) clientErrors.state = ['State must be at least 2 characters'];

    const displayOrder = Number(values.display_order || '0');
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      clientErrors.display_order = ['Enter a whole number'];
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setErrors({});

    const payload = {
      name: values.name,
      slug: values.slug,
      city: values.city,
      state: values.state,
      country: values.country || 'Nigeria',
      description: values.description,
      is_featured: values.is_featured,
      display_order: displayOrder,
    };

    startTransition(async () => {
      try {
        const response = await fetch(
          mode === 'create' ? '/api/admin/locations' : `/api/admin/locations/${locationId}`,
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

        toast.success(mode === 'create' ? 'Location created' : 'Location saved');
        router.push('/admin/locations');
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
          <CardTitle className="text-base">Location Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="e.g. Lekki Phase 1"
            />
            {fieldError('name')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={values.slug}
              onChange={(event) => setField('slug', event.target.value)}
              placeholder="Leave empty to generate from name"
            />
            {fieldError('slug')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={values.city}
              onChange={(event) => setField('city', event.target.value)}
              placeholder="e.g. Lagos"
            />
            {fieldError('city')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={values.state}
              onChange={(event) => setField('state', event.target.value)}
              placeholder="e.g. Lagos"
            />
            {fieldError('state')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={values.country}
              onChange={(event) => setField('country', event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              min="0"
              value={values.display_order}
              onChange={(event) => setField('display_order', event.target.value)}
            />
            {fieldError('display_order')}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={values.description}
              onChange={(event) => setField('description', event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_featured"
              checked={values.is_featured}
              onCheckedChange={(checked) => setField('is_featured', checked)}
            />
            <Label htmlFor="is_featured">Featured (shown on the homepage)</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Location' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/locations')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
