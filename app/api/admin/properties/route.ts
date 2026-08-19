import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import {
  getManagedPropertyImagePath,
  PROPERTY_IMAGE_BUCKET,
} from '@/lib/property-image-storage';
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
  httpUrlSchema,
  propertyImageSchema,
} from '@/lib/admin-schemas';

/**
 * Server-side validation for property creation.
 * Mirrors the properties table constraints (migration 006).
 */
const createPropertySchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(200, 'Title is too long'),
  slug: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .max(10000, 'Description is too long')
    .optional()
    .or(z.literal('')),
  property_id: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal('')),
  property_type: z.enum(PROPERTY_TYPES),
  transaction_type: z.enum(TRANSACTION_TYPES),
  status: z.enum(PROPERTY_STATUSES).default('draft'),
  price: z.number().nonnegative('Price cannot be negative').max(999_999_999_999),
  currency: z.string().trim().length(3, 'Currency must be a 3-letter code').default('NGN'),
  location_id: z.string().uuid().nullable().optional(),
  address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal('')),
  bedrooms: z.number().int().min(0).max(100).nullable().optional(),
  bathrooms: z.number().int().min(0).max(100).nullable().optional(),
  toilets: z.number().int().min(0).max(100).nullable().optional(),
  area: z.number().nonnegative().max(99_999_999).nullable().optional(),
  year_built: z.number().int().min(1800).max(2100).nullable().optional(),
  parking_spaces: z.number().int().min(0).max(100).nullable().optional(),
  floors: z.number().int().min(0).max(500).nullable().optional(),
  is_furnished: z.boolean().default(false),
  agent_id: z.string().uuid().nullable().optional(),
  video_url: httpUrlSchema.optional().or(z.literal('')),
  meta_title: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal('')),
  meta_description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal('')),
  is_featured: z.boolean().default(false),
  images: z.array(propertyImageSchema).max(30).default([]),
  amenity_ids: z.array(z.string().uuid()).max(50).default([]),
});

/**
 * POST /api/admin/properties
 * Admin-only property creation. Inserts the property, its gallery images,
 * and its amenity links. The admin identity comes from the session — RLS
 * enforces the same check at the database level.
 */
export async function POST(request: Request) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const urlFields = (['video_url', 'images'] as const).filter(
      (field) => fieldErrors[field]?.length
    );
    if (urlFields.length > 0) {
      console.warn('Admin property URL validation rejected input.', {
        route: 'POST /api/admin/properties',
        fields: urlFields,
      });
    }
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.title);
  if (!slug) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: { title: ['Enter a title that can be turned into a slug'] } },
      { status: 400 }
    );
  }

  // Keep the featured_image column in sync with the gallery: prefer the
  // image flagged as featured, fall back to the first image.
  const featuredGalleryImage =
    data.images.find((image) => image.is_featured) ?? data.images[0];

  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from('properties')
    .insert({
      title: data.title,
      slug,
      description: data.description || null,
      property_id: data.property_id || null,
      property_type: data.property_type,
      transaction_type: data.transaction_type,
      status: data.status,
      price: data.price,
      currency: data.currency.toUpperCase(),
      location_id: data.location_id ?? null,
      address: data.address || null,
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ?? null,
      toilets: data.toilets ?? null,
      area: data.area ?? null,
      year_built: data.year_built ?? null,
      parking_spaces: data.parking_spaces ?? null,
      floors: data.floors ?? null,
      is_furnished: data.is_furnished,
      agent_id: data.agent_id ?? null,
      featured_image: featuredGalleryImage?.url ?? null,
      video_url: data.video_url || null,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      is_featured: data.is_featured,
    })
    .select('id, slug')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: { slug: ['This slug is already in use'] } },
        { status: 409 }
      );
    }
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'The selected location or agent no longer exists' },
        { status: 400 }
      );
    }
    console.error('Error creating property:', error.message);
    return NextResponse.json({ error: 'Unable to create the property right now' }, { status: 500 });
  }

  // Gallery images — the unique partial index allows at most one featured
  // image per property, so only the first flagged image keeps the flag.
  if (data.images.length > 0) {
    let featuredSeen = false;
    const rows = data.images.map((image, index) => {
      const isFeatured = image.is_featured && !featuredSeen;
      if (image.is_featured) featuredSeen = true;
      return {
        property_id: property.id,
        url: image.url,
        alt_text: image.alt_text || null,
        display_order: image.display_order ?? index,
        is_featured: isFeatured,
      };
    });

    const { error: imagesError } = await supabase.from('property_images').insert(rows);
    if (imagesError) {
      console.error('Error saving property images:', imagesError.message);
      await supabase.from('properties').delete().eq('id', property.id);
      const managedPaths = data.images
        .map((image) => getManagedPropertyImagePath(image.url))
        .filter((path): path is string => path !== null);
      if (managedPaths.length > 0) {
        await supabase.storage.from(PROPERTY_IMAGE_BUCKET).remove(managedPaths);
      }
      return NextResponse.json(
        { error: 'Unable to create the property gallery' },
        { status: 500 }
      );
    }
  }

  if (data.amenity_ids.length > 0) {
    const { error: amenitiesError } = await supabase.from('property_amenities').insert(
      data.amenity_ids.map((amenityId) => ({
        property_id: property.id,
        amenity_id: amenityId,
      }))
    );
    if (amenitiesError) {
      console.error('Error saving property amenities:', amenitiesError.message);
      await supabase.from('properties').delete().eq('id', property.id);
      const managedPaths = data.images
        .map((image) => getManagedPropertyImagePath(image.url))
        .filter((path): path is string => path !== null);
      if (managedPaths.length > 0) {
        await supabase.storage.from(PROPERTY_IMAGE_BUCKET).remove(managedPaths);
      }
      return NextResponse.json(
        { error: 'Unable to create the property amenities' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true, id: property.id, slug: property.slug }, { status: 201 });
}
