import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import {
  getManagedPropertyImagePath,
  getPropertyImagePublicUrl,
  isManagedPropertyImagePath,
} from '../lib/property-image-storage.ts';

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const propertyId = '11111111-1111-4111-8111-111111111111';
const imageId = '22222222-2222-4222-8222-222222222222';
const managedPath = `properties/${propertyId}/${imageId}.jpg`;
const projectOrigin = 'https://example-project.supabase.co';
const publicUrl = `${projectOrigin}/storage/v1/object/public/property-images/${managedPath}`;

before(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = projectOrigin;
});

after(() => {
  if (originalSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
});

test('accepts a canonical managed Supabase public URL', () => {
  assert.equal(getManagedPropertyImagePath(publicUrl), managedPath);
  assert.equal(getPropertyImagePublicUrl(managedPath), publicUrl);
});

test('rejects malformed, relative, external, and empty URLs without throwing', () => {
  for (const value of ['not a url', '/relative/image.jpg', '', `${projectOrigin}/%`]) {
    assert.doesNotThrow(() => getManagedPropertyImagePath(value));
    assert.equal(getManagedPropertyImagePath(value), null);
  }

  assert.equal(
    getManagedPropertyImagePath(
      `https://attacker.example/storage/v1/object/public/property-images/${managedPath}`
    ),
    null
  );
});

test('rejects malformed Supabase configuration without throwing', () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'missing-scheme.example.com';
  assert.doesNotThrow(() => getManagedPropertyImagePath(publicUrl));
  assert.equal(getManagedPropertyImagePath(publicUrl), null);
  assert.equal(getPropertyImagePublicUrl(managedPath), null);
  process.env.NEXT_PUBLIC_SUPABASE_URL = projectOrigin;
});

test('rejects traversal and non-managed paths', () => {
  assert.equal(isManagedPropertyImagePath(`properties/${propertyId}/../${imageId}.jpg`), false);
  assert.equal(isManagedPropertyImagePath(`properties/${propertyId}/${imageId}.svg`), false);
});
