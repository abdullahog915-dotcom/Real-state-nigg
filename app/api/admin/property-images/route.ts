import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import {
  hasValidPropertyImageSignature,
  isManagedPropertyImagePath,
  PROPERTY_IMAGE_BUCKET,
  PROPERTY_IMAGE_MAX_BYTES,
  PROPERTY_IMAGE_MAX_FILES,
  PROPERTY_IMAGE_MIME_TYPES,
  propertyImageExtension,
  type PropertyImageMimeType,
} from '@/lib/property-image-storage';
import { createClient } from '@/lib/supabase/server';

const uuidSchema = z.string().uuid();
const deleteSchema = z.object({
  paths: z.array(z.string().max(300)).min(1).max(PROPERTY_IMAGE_MAX_FILES),
});

function uploadError(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Uploads one admin-selected image batch through the authenticated RLS client. */
export async function POST(request: Request) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  const formData = await request.formData().catch(() => null);
  if (!formData) return uploadError('Invalid multipart upload');

  const files = formData.getAll('files').filter((value): value is File => value instanceof File);
  if (files.length === 0) return uploadError('Select at least one image');
  if (files.length > PROPERTY_IMAGE_MAX_FILES) {
    return uploadError(`Upload no more than ${PROPERTY_IMAGE_MAX_FILES} images at once`);
  }

  const requestedPropertyId = formData.get('property_id');
  const propertyId = typeof requestedPropertyId === 'string' && requestedPropertyId
    ? requestedPropertyId
    : null;
  if (propertyId && !uuidSchema.safeParse(propertyId).success) {
    return uploadError('Invalid property id');
  }

  const supabase = await createClient();
  if (propertyId) {
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .maybeSingle();
    if (error || !data) return uploadError('Property not found', 404);
  }

  const validated: Array<{ file: File; bytes: Uint8Array; mimeType: PropertyImageMimeType }> = [];
  for (const file of files) {
    if (!PROPERTY_IMAGE_MIME_TYPES.includes(file.type as PropertyImageMimeType)) {
      return uploadError(`${file.name}: only JPEG, PNG, and WebP images are allowed`);
    }
    if (file.size === 0 || file.size > PROPERTY_IMAGE_MAX_BYTES) {
      return uploadError(`${file.name}: images must be between 1 byte and 10 MB`);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const mimeType = file.type as PropertyImageMimeType;
    if (!hasValidPropertyImageSignature(bytes, mimeType)) {
      return uploadError(`${file.name}: file contents do not match the declared image type`);
    }
    validated.push({ file, bytes, mimeType });
  }

  const group = propertyId ? `properties/${propertyId}` : `uploads/${crypto.randomUUID()}`;
  const uploadedPaths: string[] = [];
  const images: Array<{ url: string; storage_path: string; original_name: string }> = [];

  for (const item of validated) {
    const path = `${group}/${crypto.randomUUID()}.${propertyImageExtension(item.mimeType)}`;
    const { error } = await supabase.storage.from(PROPERTY_IMAGE_BUCKET).upload(path, item.bytes, {
      cacheControl: '31536000',
      contentType: item.mimeType,
      upsert: false,
    });

    if (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(PROPERTY_IMAGE_BUCKET).remove(uploadedPaths);
      }
      console.error('Property image upload failed:', {
        code: 'storage_upload_failed',
        message: error.message,
      });
      return uploadError('Unable to upload the selected images right now', 500);
    }

    uploadedPaths.push(path);
    const { data } = supabase.storage.from(PROPERTY_IMAGE_BUCKET).getPublicUrl(path);
    images.push({ url: data.publicUrl, storage_path: path, original_name: item.file.name });
  }

  return NextResponse.json({ images }, { status: 201 });
}

/** Removes only strictly validated objects created by this uploader. */
export async function DELETE(request: Request) {
  const denied = await adminApiGuard();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success || parsed.data.paths.some((path) => !isManagedPropertyImagePath(path))) {
    return uploadError('Invalid managed image path');
  }

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(PROPERTY_IMAGE_BUCKET)
    .remove([...new Set(parsed.data.paths)]);
  if (error) {
    console.error('Property image cleanup failed:', { message: error.message });
    return uploadError('Unable to remove the image right now', 500);
  }

  return NextResponse.json({ success: true });
}
