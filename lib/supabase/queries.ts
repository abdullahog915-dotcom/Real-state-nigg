import { createClient } from './server';

/**
 * Get featured properties for the homepage.
 * Returns properties with status 'featured' or 'published' where is_featured is true.
 * Falls back to latest published properties if no featured ones exist.
 */
export async function getFeaturedProperties(limit = 6) {
  const supabase = await createClient();

  // First try to get explicitly featured properties
  const { data: featured, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      slug,
      description,
      property_type,
      transaction_type,
      status,
      price,
      currency,
      bedrooms,
      bathrooms,
      toilets,
      area,
      featured_image,
      is_featured,
      address,
      published_at,
      locations (
        id,
        name,
        slug,
        city,
        state
      ),
      agents (
        id,
        name,
        slug,
        photo_url,
        phone,
        whatsapp
      )
    `)
    .in('status', ['published', 'featured'])
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured properties:', error.message);
    return [];
  }

  // If we have enough featured properties, return them
  if (featured && featured.length >= limit) {
    return featured;
  }

  // Otherwise, fill with latest published properties
  const featuredIds = featured?.map((p) => p.id) ?? [];
  const remaining = limit - (featured?.length ?? 0);

  const { data: latest, error: latestError } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      slug,
      description,
      property_type,
      transaction_type,
      status,
      price,
      currency,
      bedrooms,
      bathrooms,
      toilets,
      area,
      featured_image,
      is_featured,
      address,
      published_at,
      locations (
        id,
        name,
        slug,
        city,
        state
      ),
      agents (
        id,
        name,
        slug,
        photo_url,
        phone,
        whatsapp
      )
    `)
    .in('status', ['published', 'featured'])
    .not('id', 'in', `(${featuredIds.map((id) => `'${id}'`).join(',')})`)
    .order('published_at', { ascending: false })
    .limit(remaining);

  if (latestError) {
    console.error('Error fetching latest properties:', latestError.message);
    return featured ?? [];
  }

  return [...(featured ?? []), ...(latest ?? [])];
}

/**
 * Get latest published properties.
 */
export async function getLatestProperties(limit = 8) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      slug,
      description,
      property_type,
      transaction_type,
      status,
      price,
      currency,
      bedrooms,
      bathrooms,
      toilets,
      area,
      featured_image,
      is_featured,
      address,
      published_at,
      locations (
        id,
        name,
        slug,
        city,
        state
      ),
      agents (
        id,
        name,
        slug,
        photo_url,
        phone,
        whatsapp
      )
    `)
    .in('status', ['published', 'featured'])
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest properties:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Get property count grouped by transaction type.
 */
export async function getPropertyCountByTransactionType() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('properties')
    .select('transaction_type')
    .in('status', ['published', 'featured']);

  if (error) {
    console.error('Error fetching property counts:', error.message);
    return { sale: 0, rent: 0, 'short-let': 0 };
  }

  const counts = { sale: 0, rent: 0, 'short-let': 0 };
  for (const property of data ?? []) {
    const type = property.transaction_type as keyof typeof counts;
    if (type in counts) {
      counts[type]++;
    }
  }

  return counts;
}

/**
 * Get featured locations for the homepage.
 */
export async function getFeaturedLocations() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('locations')
    .select(`
      id,
      name,
      slug,
      city,
      state,
      country,
      description,
      is_featured,
      display_order
    `)
    .eq('is_featured', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching featured locations:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Get property count per city.
 */
export async function getPropertyCountByCity() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      locations (
        city
      )
    `)
    .in('status', ['published', 'featured']);

  if (error) {
    console.error('Error fetching property count by city:', error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const property of data ?? []) {
    const city = (property.locations as unknown as { city: string } | null)?.city;
    if (city) {
      counts[city] = (counts[city] ?? 0) + 1;
    }
  }

  return counts;
}

/**
 * Get active agents for the homepage.
 */
export async function getActiveAgents(limit = 6) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agents')
    .select(`
      id,
      name,
      slug,
      email,
      phone,
      whatsapp,
      bio,
      photo_url,
      specialization,
      locations,
      is_active,
      display_order
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching active agents:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Get total published property count.
 */
export async function getTotalPropertyCount() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .in('status', ['published', 'featured']);

  if (error) {
    console.error('Error fetching property count:', error.message);
    return 0;
  }

  return count ?? 0;
}

/**
 * Get all locations for search dropdown.
 */
export async function getAllLocations() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('locations')
    .select('id, name, slug, city, state')
    .order('city', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching locations:', error.message);
    return [];
  }

  return data ?? [];
}
