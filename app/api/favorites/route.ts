import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * Validation schema for favorite mutations.
 * Only the property_id is accepted from the client — the user_id is always
 * derived from the session so favorites can never be written for another user.
 */
const favoriteSchema = z.object({
  property_id: z.string().uuid('Enter a valid property id'),
});

/**
 * GET /api/favorites
 * Returns the signed-in user's favorited property IDs, newest favorite first.
 * Returns 401 for anonymous requests.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('property_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error.message);
    return NextResponse.json(
      { error: 'Unable to load your favorites right now. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ propertyIds: data?.map((favorite) => favorite.property_id) ?? [] });
}

/**
 * POST /api/favorites
 * Adds a property to the signed-in user's favorites.
 * Only published/featured properties can be favorited, and re-favoriting an
 * already-favorited property is treated as success (UNIQUE constraint guard).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Only publicly visible properties can be favorited
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id')
    .eq('id', parsed.data.property_id)
    .in('status', ['published', 'featured'])
    .maybeSingle();

  if (propertyError) {
    console.error('Error validating property for favorite:', propertyError.message);
    return NextResponse.json(
      { error: 'Unable to save this favorite right now. Please try again.' },
      { status: 500 }
    );
  }

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    property_id: parsed.data.property_id,
  });

  if (error) {
    // UNIQUE(user_id, property_id) violation — already favorited, treat as success
    if (error.code === '23505') {
      return NextResponse.json({ success: true });
    }
    console.error('Error saving favorite:', error.message);
    return NextResponse.json(
      { error: 'Unable to save this favorite right now. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

/**
 * DELETE /api/favorites
 * Removes a property from the signed-in user's favorites.
 * Idempotent — removing a property that is not favorited still succeeds.
 */
export async function DELETE(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('property_id', parsed.data.property_id);

  if (error) {
    console.error('Error removing favorite:', error.message);
    return NextResponse.json(
      { error: 'Unable to remove this favorite right now. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
