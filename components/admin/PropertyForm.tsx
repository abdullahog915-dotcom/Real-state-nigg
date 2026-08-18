'use client';

import Image from 'next/image';
import { useState, useTransition, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
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
import {
  PROPERTY_IMAGE_MAX_BYTES,
  PROPERTY_IMAGE_MAX_FILES,
  PROPERTY_IMAGE_MIME_TYPES,
} from '@/lib/property-image-storage';
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
  id?: string;
  url: string;
  alt_text: string;
  is_featured: boolean;
  storage_path?: string;
  is_new_upload?: boolean;
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const setField = <K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const setImage = (index: number, patch: Partial<PropertyFormImage>) => {
    setValues((current) => ({
      ...current,
      images: current.images.map((image, i) => (i === index ? { ...image, ...patch } : image)),
    }));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setValues((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.images.length) return current;
      const images = [...current.images];
      [images[index], images[nextIndex]] = [images[nextIndex], images[index]];
      return { ...current, images };
    });
  };

  const removeImage = async (index: number) => {
    const image = values.images[index];
    if (image?.is_new_upload && image.storage_path) {
      const response = await fetch('/api/admin/property-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: [image.storage_path] }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(body?.error ?? 'Unable to remove the uploaded image');
        return;
      }
    }

    setValues((current) => {
      const images = current.images.filter((_, imageIndex) => imageIndex !== index);
      if (image?.is_featured && images.length > 0) images[0] = { ...images[0], is_featured: true };
      return { ...current, images };
    });
  };

  const uploadFiles = (files: File[]) => {
    const available = PROPERTY_IMAGE_MAX_FILES - values.images.length;
    if (files.length > available) {
      toast.error(`You can add up to ${PROPERTY_IMAGE_MAX_FILES} gallery images`);
      return;
    }

    for (const file of files) {
      if (!PROPERTY_IMAGE_MIME_TYPES.includes(file.type as (typeof PROPERTY_IMAGE_MIME_TYPES)[number])) {
        toast.error(`${file.name}: only JPEG, PNG, and WebP images are allowed`);
        return;
      }
      if (file.size === 0 || file.size > PROPERTY_IMAGE_MAX_BYTES) {
        toast.error(`${file.name}: images must be no larger than 10 MB`);
        return;
      }
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (mode === 'edit' && propertyId) formData.append('property_id', propertyId);

    setIsUploading(true);
    setUploadProgress(0);
    const request = new XMLHttpRequest();
    request.open('POST', '/api/admin/property-images');
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => {
      setIsUploading(false);
      toast.error('The image upload was interrupted');
    };
    request.onload = () => {
      setIsUploading(false);
      const body = (() => {
        try {
          return JSON.parse(request.responseText);
        } catch {
          return null;
        }
      })();
      if (request.status < 200 || request.status >= 300) {
        toast.error(body?.error ?? 'Unable to upload the selected images');
        return;
      }

      setValues((current) => {
        const hasCover = current.images.some((image) => image.is_featured);
        const uploaded: PropertyFormImage[] = body.images.map(
          (image: { url: string; storage_path: string; original_name: string }, index: number) => ({
            url: image.url,
            storage_path: image.storage_path,
            alt_text: image.original_name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
            is_featured: !hasCover && index === 0,
            is_new_upload: true,
          })
        );
        return { ...current, images: [...current.images, ...uploaded] };
      });
      setUploadProgress(100);
      toast.success(`${files.length} ${files.length === 1 ? 'image' : 'images'} uploaded`);
    };
    request.send(formData);
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length > 0) uploadFiles(files);
  };

  const cleanupNewUploads = async () => {
    const paths = values.images
      .filter((image) => image.is_new_upload && image.storage_path)
      .map((image) => image.storage_path as string);
    if (paths.length > 0) {
      await fetch('/api/admin/property-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths }),
      });
    }
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
    if (isUploading) {
      toast.error('Wait for the image upload to finish');
      return;
    }
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
        is_featured:
          image.is_featured ||
          (index === 0 && !filledImages.some((candidate) => candidate.is_featured)),
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

      {/* Pricing, Location & Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing, Location &amp; Options</CardTitle>
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

          <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
            <div className="relative z-10 flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={values.is_featured}
                onCheckedChange={(checked) => setField('is_featured', checked)}
              />
              <Label htmlFor="is_featured" className="cursor-pointer">Featured listing</Label>
            </div>
            <div className="relative z-10 flex items-center gap-2">
              <Switch
                id="is_furnished"
                checked={values.is_furnished}
                onCheckedChange={(checked) => setField('is_furnished', checked)}
              />
              <Label htmlFor="is_furnished" className="cursor-pointer">Furnished</Label>
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
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Gallery Images</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              JPEG, PNG, or WebP. Maximum 10 MB each and 30 images per property.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setField('images', [
                  ...values.images,
                  { url: '', alt_text: '', is_featured: values.images.length === 0 },
                ])
              }
              disabled={isUploading || values.images.length >= PROPERTY_IMAGE_MAX_FILES}
            >
              <Plus className="h-4 w-4" /> Add URL
            </Button>
            <Button
              type="button"
              size="sm"
              asChild
              className={isUploading || values.images.length >= PROPERTY_IMAGE_MAX_FILES ? 'pointer-events-none opacity-50' : ''}
            >
              <label>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Images'}
                <input
                  type="file"
                  className="sr-only"
                  accept={PROPERTY_IMAGE_MIME_TYPES.join(',')}
                  multiple
                  onChange={handleFileSelection}
                  disabled={isUploading || values.images.length >= PROPERTY_IMAGE_MAX_FILES}
                />
              </label>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Upload from your computer or keep using an external image URL. Choose one cover image;
            it is used on property cards. Use the arrow buttons to set gallery order.
          </p>
          {isUploading && (
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Image upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={uploadProgress}
            >
              <div
                className="h-full bg-primary transition-[width]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          {values.images.length === 0 && (
            <p className="text-sm text-muted-foreground">No images added.</p>
          )}
          {values.images.map((image, index) => (
            <div
              key={image.id ?? image.storage_path ?? index}
              className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[8rem_1fr_auto]"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={image.alt_text || `Property image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 space-y-2">
                <Input
                  value={image.url}
                  onChange={(event) => setImage(index, { url: event.target.value })}
                  placeholder="External image URL"
                  aria-label={`Image ${index + 1} URL`}
                  readOnly={Boolean(image.storage_path)}
                />
                <Input
                  value={image.alt_text}
                  onChange={(event) => setImage(index, { alt_text: event.target.value })}
                  placeholder="Describe the image for accessibility"
                  aria-label={`Image ${index + 1} alt text`}
                />
                <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="featured-image"
                    className="h-4 w-4 accent-primary"
                    checked={image.is_featured}
                    onChange={() =>
                      setField(
                        'images',
                        values.images.map((item, imageIndex) => ({
                          ...item,
                          is_featured: imageIndex === index,
                        }))
                      )
                    }
                  />
                  Cover image
                </label>
              </div>
              <div className="flex items-center justify-end gap-1 md:flex-col md:justify-start">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move image ${index + 1} up`}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === values.images.length - 1}
                  aria-label={`Move image ${index + 1} down`}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove image ${index + 1}`}
                  onClick={() => void removeImage(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
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
        <Button type="button" onClick={handleSubmit} disabled={isPending || isUploading}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Property' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void cleanupNewUploads().finally(() => router.push('/admin/properties'));
          }}
          disabled={isPending || isUploading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
