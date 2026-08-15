'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PROPERTY_STATUSES, PROPERTY_TYPES, TRANSACTION_TYPES } from '@/lib/admin-schemas';
import { getPropertyTypeLabel, getTransactionTypeLabel } from '@/lib/utils';

const NONE = '__none__';

export interface PropertyFormLocation {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface PropertyFormAgent {
  id: string;
  name: string;
  is_active: boolean;
}

export interface PropertyFormAmenity {
  id: string;
  name: string;
  category: string | null;
}

export interface PropertyFormImage {
  url: string;
  alt_text: string;
  is_featured: boolean;
}

export interface PropertyFormValues {
  title: string;
  slug: string;
  property_id: string;
  description: string;
  property_type: string;
  transaction_type: string;
  status: string;
  price: string;
  currency: string;
  location_id: string;
  agent_id: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  toilets: string;
  area: string;
  year_built: string;
  parking_spaces: string;
  floors: string;
  is_furnished: boolean;
  is_featured: boolean;
  video_url: string;
  meta_title: string;
  meta_description: string;
  amenity_ids: string[];
  images: PropertyFormImage[];
}

export const DEFAULT_PROPERTY_VALUES: PropertyFormValues = {
  title: '',
  slug: '',
  property_id: '',
  description: '',
  property_type: 'apartment',
  transaction_type: 'sale',
  status: 'draft',
  price: '',
  currency: 'NGN',
  location_id: '',
  agent_id: '',
  address: '',
  bedrooms: '',
  bathrooms: '',
  toilets: '',
  area: '',
  year_built: '',
  parking_spaces: '',
  floors: '',
  is_furnished: false,
  is_featured: false,
  video_url: '',
  meta_title: '',
  meta_description: '',
  amenity_ids: [],
  images: [],
};

interface PropertyFormProps {
  mode: 'create' | 'edit';
  propertyId?: string;
  initialValues?: Partial<PropertyFormValues>;
  locations: PropertyFormLocation[];
  agents: PropertyFormAgent[];
  amenities: PropertyFormAmenity[];
}

/** Parse a text input into a non-negative integer or null. */
function toIntOrNull(value: string): number | null | 'invalid' {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) return 'invalid';
  return parsed;
}

/** Parse a text input into a non-negative number or null. */
function toNumberOrNull(value: string): number | null | 'invalid' {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 'invalid';
  return parsed;
}

/**
 * Admin property create/edit form. Talks to /api/admin/properties;
 * all validation is repeated server-side by the route handlers.
 */
export function PropertyForm({
  mode,
  propertyId,
  initialValues,
  locations,
  agents,
  amenities,
}: PropertyFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<PropertyFormValues>({
    ...DEFAULT_PROPERTY_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const setField = <K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const setImage = (index: number, patch: Partial<PropertyFormImage>) => {
    setValues((current) => ({
      ...current,
      images: current.images.map((image, i) => (i === index ? { ...image, ...patch } : image)),
    }));
  };

  const amenitiesByCategory = amenities.reduce<Record<string, PropertyFormAmenity[]>>(
    (groups, amenity) => {
      const key = amenity.category ?? 'general';
      (groups[key] ??= []).push(amenity);
      return groups;
    },
    {}
  );

  const handleSubmit = () => {
    // Client-side sanity checks (the API validates everything again)
    const clientErrors: Record<string, string[]> = {};

    if (values.title.trim().length < 3) clientErrors.title = ['Title must be at least 3 characters'];

    const price = Number(values.price);
    if (values.price.trim() === '' || !Number.isFinite(price) || price < 0) {
      clientErrors.price = ['Enter a valid price'];
    }

    for (const key of ['bedrooms', 'bathrooms', 'toilets', 'year_built', 'parking_spaces', 'floors'] as const) {
      if (toIntOrNull(values[key]) === 'invalid') {
        clientErrors[key] = ['Enter a whole number or leave empty'];
      }
    }
    if (toNumberOrNull(values.area) === 'invalid') {
      clientErrors.area = ['Enter a number or leave empty'];
    }

    const filledImages = values.images.filter((image) => image.url.trim() !== '');
    for (const image of filledImages) {
      try {
        new URL(image.url);
      } catch {
        clientErrors.images = ['Every gallery image needs a valid URL'];
        break;
      }
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
      property_id: values.property_id,
      description: values.description,
      property_type: values.property_type,
      transaction_type: values.transaction_type,
      status: values.status,
      price,
      currency: values.currency.trim() || 'NGN',
      location_id: values.location_id || null,
      agent_id: values.agent_id || null,
      address: values.address,
      bedrooms: toIntOrNull(values.bedrooms),
      bathrooms: toIntOrNull(values.bathrooms),
      toilets: toIntOrNull(values.toilets),
      area: toNumberOrNull(values.area),
      year_built: toIntOrNull(values.year_built),
      parking_spaces: toIntOrNull(values.parking_spaces),
      floors: toIntOrNull(values.floors),
      is_furnished: values.is_furnished,
      is_featured: values.is_featured,
      video_url: values.video_url,
      meta_title: values.meta_title,
      meta_description: values.meta_description,
      amenity_ids: values.amenity_ids,
      images: filledImages.map((image, index) => ({
        url: image.url.trim(),
        alt_text: image.alt_text,
        display_order: index,
        is_featured: image.is_featured,
      })),
    };

    startTransition(async () => {
      try {
        const response = await fetch(
          mode === 'create' ? '/api/admin/properties' : `/api/admin/properties/${propertyId}`,
          {
            method: mode === 'create' ? 'POST' : 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          if (body?.fieldErrors) {
            setErrors(body.fieldErrors);
          }
          throw new Error(body?.error ?? 'Something went wrong');
        }

        toast.success(mode === 'create' ? 'Property created' : 'Property saved');
        router.push('/admin/properties');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Something went wrong');
      }
    });
  };

  const fieldError = (key: string) =>
    errors[key]?.length ? (
      <p className="text-xs text-destructive">{errors[key][0]}</p>
    ) : null;

  return (
    <div className="space-y-6">
      {Object.keys(errors).length > 0 && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Some fields need attention. Please review the messages below.
        </div>
      )}

      {/* Basics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="e.g. 4 Bedroom Detached Duplex in Lekki Phase 1"
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
            <Label htmlFor="property_id">Public Reference ID</Label>
            <Input
              id="property_id"
              value={values.property_id}
              onChange={(event) => setField('property_id', event.target.value)}
              placeholder="e.g. PROP-00123"
            />
            {fieldError('property_id')}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={values.description}
              onChange={(event) => setField('description', event.target.value)}
            />
            {fieldError('description')}
          </div>

          <div className="space-y-2">
            <Label>Property Type *</Label>
            <Select
              value={values.property_type}
              onValueChange={(value) => setField('property_type', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getPropertyTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Select
              value={values.transaction_type}
              onValueChange={(value) => setField('transaction_type', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getTransactionTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status *</Label>
            <Select value={values.status} onValueChange={(value) => setField('status', value)}>
              <SelectTrigger className="w-full capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_STATUSES.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError('status')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={values.address}
              onChange={(event) => setField('address', event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing &amp; Assignment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="any"
              value={values.price}
              onChange={(event) => setField('price', event.target.value)}
            />
            {fieldError('price')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={values.currency}
              maxLength={3}
              onChange={(event) => setField('currency', event.target.value.toUpperCase())}
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={values.location_id || NONE}
              onValueChange={(value) => setField('location_id', value === NONE ? '' : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No location</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}, {location.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError('location_id')}
          </div>

          <div className="space-y-2">
            <Label>Agent</Label>
            <Select
              value={values.agent_id || NONE}
              onValueChange={(value) => setField('agent_id', value === NONE ? '' : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No agent</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                    {agent.is_active ? '' : ' (inactive)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError('agent_id')}
          </div>

          <div className="flex items-center gap-6 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={values.is_featured}
                onCheckedChange={(checked) => setField('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Featured listing</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_furnished"
                checked={values.is_furnished}
                onCheckedChange={(checked) => setField('is_furnished', checked)}
              />
              <Label htmlFor="is_furnished">Furnished</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['bedrooms', 'Bedrooms'],
              ['bathrooms', 'Bathrooms'],
              ['toilets', 'Toilets'],
              ['area', 'Area (sqm)'],
              ['year_built', 'Year Built'],
              ['parking_spaces', 'Parking Spaces'],
              ['floors', 'Floors'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="number"
                min="0"
                step={key === 'area' ? 'any' : '1'}
                value={values[key]}
                onChange={(event) => setField(key, event.target.value)}
              />
              {fieldError(key)}
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              value={values.video_url}
              onChange={(event) => setField('video_url', event.target.value)}
              placeholder="https://..."
            />
            {fieldError('video_url')}
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          {amenities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No amenities exist in the database yet.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(amenitiesByCategory).map(([category, items]) => (
                <div key={category}>
                  <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                    {category}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((amenity) => (
                      <label key={amenity.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input"
                          checked={values.amenity_ids.includes(amenity.id)}
                          onChange={(event) => {
                            setField(
                              'amenity_ids',
                              event.target.checked
                                ? [...values.amenity_ids, amenity.id]
                                : values.amenity_ids.filter((id) => id !== amenity.id)
                            );
                          }}
                        />
                        {amenity.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery images */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Gallery Images</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setField('images', [...values.images, { url: '', alt_text: '', is_featured: false }])
            }
          >
            <Plus className="h-4 w-4" /> Add Image
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Paste image URLs (e.g. from a storage bucket or CDN). Mark exactly one image as the
            cover — it is also used as the listing thumbnail. Direct file upload is not wired up
            yet (storage bucket exists but no upload endpoint has been built).
          </p>
          {values.images.length === 0 && (
            <p className="text-sm text-muted-foreground">No images added.</p>
          )}
          {values.images.map((image, index) => (
            <div key={index} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto_auto]">
              <Input
                value={image.url}
                onChange={(event) => setImage(index, { url: event.target.value })}
                placeholder="Image URL"
                aria-label={`Image ${index + 1} URL`}
              />
              <Input
                value={image.alt_text}
                onChange={(event) => setImage(index, { alt_text: event.target.value })}
                placeholder="Alt text (optional)"
                aria-label={`Image ${index + 1} alt text`}
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="radio"
                  name="featured-image"
                  className="h-4 w-4"
                  checked={image.is_featured}
                  onChange={() =>
                    setField(
                      'images',
                      values.images.map((item, i) => ({ ...item, is_featured: i === index }))
                    )
                  }
                />
                Cover
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove image ${index + 1}`}
                onClick={() =>
                  setField('images', values.images.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {fieldError('images')}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              value={values.meta_title}
              onChange={(event) => setField('meta_title', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              rows={3}
              value={values.meta_description}
              onChange={(event) => setField('meta_description', event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Property' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/properties')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
