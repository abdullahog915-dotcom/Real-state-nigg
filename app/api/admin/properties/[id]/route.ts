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
  propertyImageSchema,
} from '@/lib/admin-schemas';

/**
 * Partial update schema — every field optional so quick actions
 * (status change, featured toggle) and the full edit form can share
 * one endpoint. Values mirror the properties table (migration 006).
 */
const updatePropertySchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  slug: z.string().trim().max(200).optional(),
  description: z.string().trim().max(10000).optional().or(z.literal('')),
  property_id: z.string().trim().max(50).optional().or(z.literal('')),
  property_type: z.enum(PROPERTY_TYPES).optional(),
  transaction_type: z.enum(TRANSACTION_TYPES).optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  price: z.number().nonnegative().max(999_999_999_999).optional(),
  currency: z.string().trim().length(3).optional(),
  location_id: z.string().uuid().nullable().optional(),
  address: z.string().trim().max(500).optional().or(z.literal('')),
  bedrooms: z.number().int().min(0).max(100).nullable().optional(),
  bathrooms: z.number().int().min(0).max(100).nullable().optional(),
  toilets: z.number().int().min(0).max(100).nullable().optional(),
  area: z.number().nonnegative().max(99_999_999).nullable().optional(),
  year_built: z.number().int().min(1800).max(2100).nullable().optional(),
  parking_spaces: z.number().int().min(0).max(100).nullable().optional(),
  floors: z.number().int().min(0).max(500).nullable().optional(),
  is_furnished: z.boolean().optional(),
  agent_id: z.string().uuid().nullable().optional(),
  featured_image: z.string().trim().max(2048).optional().or(z.literal('')),
  video_url: z.string().trim().url().max(2048).optional().or(z.literal('')),
  meta_title: z.string().trim().max(200).optional().or(z.literal('')),
  meta_description: z.string().trim().max(500).optional().or(z.literal('')),
  is_featured: z.boolean().optional(),
  // When present, the gallery / amenities are REPLACED with these rows.
  images: z.array(propertyImageSchema).max(30).optional(),
  amenity_ids: z.array(z.string().uuid()).max(50).optional(),
});

const uuidSchema = z.string().uuid();

/**
 * PATCH /api/admin/properties/[id]
 * Partial property update. Only fields present in the validated body are
 * written; `images` and `amenity_ids` replace the existing rows.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid property id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = updatePropertySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const { images, amenity_ids, slug, ...scalarFields } = data;

  const supabase = await createClient();

  // Verify the property exists (also proves admin RLS visibility)
  const { data: existing, error: findError } = await supabase
    .from('properties')
    .select('id, property_images (url)')
    .eq('id', id)
    .maybeSingle();

  if (findError || !existing) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  // Scalar columns (only those provided)
  if (Object.keys(scalarFields).length > 0 || slug !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = { ...scalarFields };
    if (slug !== undefined) update.slug = slugify(slug);
    if (update.currency) update.currency = update.currency.toUpperCase();
    // Empty optional strings are stored as NULL
    for (const key of ['description', 'property_id', 'address', 'video_url', 'meta_title', 'meta_description', 'featured_image'] as const) {
      if (update[key] === '') update[key] = null;
    }

    const { error } = await supabase.from('properties').update(update).eq('id', id);
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
      console.error('Error updating property:', error.message);
      return NextResponse.json({ error: 'Unable to update the property right now' }, { status: 500 });
    }
  }

  // Gallery replacement
  if (images) {
    const previousManagedPaths = (existing.property_images ?? [])
      .map((image) => getManagedPropertyImagePath(image.url))
      .filter((path): path is string => path !== null);

    const { error: deleteError } = await supabase
      .from('property_images')
      .delete()
      .eq('property_id', id);
    if (deleteError) {
      console.error('Error clearing property images:', deleteError.message);
      return NextResponse.json({ error: 'Unable to update gallery images' }, { status: 500 });
    }

    if (images.length > 0) {
      let featuredSeen = false;
      const rows = images.map((image, index) => {
        const isFeatured = image.is_featured && !featuredSeen;
        if (image.is_featured) featuredSeen = true;
        return {
          property_id: id,
          url: image.url,
          alt_text: image.alt_text || null,
          display_order: image.display_order ?? index,
          is_featured: isFeatured,
        };
      });

      const { error: insertError } = await supabase.from('property_images').insert(rows);
      if (insertError) {
        console.error('Error saving property images:', insertError.message);
        return NextResponse.json({ error: 'Unable to save gallery images' }, { status: 500 });
      }

      // Keep the card thumbnail column in sync with the gallery
      const featuredUrl = rows.find((row) => row.is_featured)?.url ?? rows[0].url;
      const { error: syncError } = await supabase
        .from('properties')
        .update({ featured_image: featuredUrl })
        .eq('id', id);
      if (syncError) {
        console.error('Error syncing featured image:', syncError.message);
      }
    } else {
      const { error: syncError } = await supabase
        .from('properties')
        .update({ featured_image: null })
        .eq('id', id);
      if (syncError) {
        console.error('Error clearing featured image:', syncError.message);
      }
    }

    const retainedManagedPaths = new Set(
      images
        .map((image) => getManagedPropertyImagePath(image.url))
        .filter((path): path is string => path !== null)
    );
    const orphanedPaths = previousManagedPaths.filter((path) => !retainedManagedPaths.has(path));
    if (orphanedPaths.length > 0) {
      const { error: cleanupError } = await supabase.storage
        .from(PROPERTY_IMAGE_BUCKET)
        .remove(orphanedPaths);
      if (cleanupError) {
        console.error('Error removing replaced property images:', cleanupError.message);
      }
    }
  }

  // Amenity replacement
  if (amenity_ids) {
    const { error: deleteError } = await supabase
      .from('property_amenities')
      .delete()
      .eq('property_id', id);
    if (deleteError) {
      console.error('Error clearing property amenities:', deleteError.message);
      return NextResponse.json({ error: 'Unable to update amenities' }, { status: 500 });
    }

    if (amenity_ids.length > 0) {
      const { error: insertError } = await supabase.from('property_amenities').insert(
        amenity_ids.map((amenityId) => ({ property_id: id, amenity_id: amenityId }))
      );
      if (insertError) {
        console.error('Error saving property amenities:', insertError.message);
        return NextResponse.json({ error: 'Unable to save amenities' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/properties/[id]
 * Deletes the property. Child rows (images, amenity links, favorites,
 * inquiries) are cleaned up by ON DELETE CASCADE / SET NULL in the schema.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid property id' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('property_images (url)')
    .eq('id', id)
    .maybeSingle();
  const managedPaths = (property?.property_images ?? [])
    .map((image) => getManagedPropertyImagePath(image.url))
    .filter((path): path is string => path !== null);

  const { data, error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    console.error('Error deleting property:', error.message);
    return NextResponse.json({ error: 'Unable to delete the property right now' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  if (managedPaths.length > 0) {
    const { error: cleanupError } = await supabase.storage
      .from(PROPERTY_IMAGE_BUCKET)
      .remove(managedPaths);
    if (cleanupError) {
      console.error('Error removing deleted property images:', cleanupError.message);
    }
  }

  return NextResponse.json({ success: true });
}
