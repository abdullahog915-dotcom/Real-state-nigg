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

/**
 * Shape of a property row returned by listing queries.
 * Includes joined location and agent data.
 */
export interface PropertyRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  property_type: string;
  transaction_type: string;
  status: string;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  area: number | null;
  featured_image: string | null;
  is_featured: boolean;
  address: string | null;
  published_at: string | null;
  created_at: string;
  locations: { id: string; name: string; slug: string; city: string; state: string } | null;
  agents: { id: string; name: string; slug: string; photo_url: string | null; phone: string | null; whatsapp: string | null } | null;
}

/**
 * Result of a paginated property listing query.
 */
export interface PropertyListResult {
  data: PropertyRow[];
  count: number;
  totalPages: number;
  page: number;
  perPage: number;
}

/**
 * Property listing filters.
 */
export interface PropertyListFilters {
  transaction_type?: string;
  property_type?: string;
  location?: string;
  keyword?: string;
  bedrooms?: number;
  min_price?: number;
  max_price?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  per_page?: number;
}

/**
 * Build the base filtered query with all filter conditions applied.
 * Shared between count and data queries to avoid duplication.
 * Uses `any` for the PostgREST builder type because Supabase's
 * generic chain types are not expressible as a standalone parameter.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyPropertyFilters(query: any, filters: {
    transaction_type?: string;
    property_type?: string;
    bedrooms?: number;
    min_price?: number;
    max_price?: number;
    keyword?: string;
    locationIds?: string[];
  }
) {
  const {
    transaction_type,
    property_type,
    bedrooms,
    min_price,
    max_price,
    keyword,
    locationIds,
  } = filters;

  query = query.in('status', ['published', 'featured']);

  if (transaction_type && ['sale', 'rent', 'short-let'].includes(transaction_type)) {
    query = query.eq('transaction_type', transaction_type as 'sale' | 'rent' | 'short-let');
  }
  if (property_type) {
    query = query.eq('property_type', property_type);
  }
  if (bedrooms != null && bedrooms > 0) {
    if (bedrooms >= 6) {
      query = query.gte('bedrooms', 6);
    } else {
      query = query.eq('bedrooms', bedrooms);
    }
  }
  if (min_price != null) {
    query = query.gte('price', min_price);
  }
  if (max_price != null) {
    query = query.lte('price', max_price);
  }
  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,description.ilike.%${keyword}%,address.ilike.%${keyword}%`
    );
  }
  if (locationIds && locationIds.length > 0) {
    query = query.in('location_id', locationIds);
  }

  return query;
}

/**
 * Get filtered, sorted, paginated properties for the listing page.
 * Returns data, count, and pagination info.
 *
 * Count is fetched first to determine valid page bounds, then data
 * is fetched only when the requested page is within range. This
 * prevents PostgREST HTTP 416 errors when range() offset exceeds
 * the result set size.
 */
export async function getProperties(filters: PropertyListFilters = {}) {
  const supabase = await createClient();

  const {
    transaction_type,
    property_type,
    location,
    keyword,
    bedrooms,
    min_price,
    max_price,
    sort = 'newest',
    page = 1,
    per_page = 12,
  } = filters;

  // Resolve location IDs early (needed by both count and data queries)
  let locationIds: string[] | undefined;
  if (location) {
    const { data: locationRows } = await supabase
      .from('locations')
      .select('id')
      .or(`name.ilike.%${location}%,city.ilike.%${location}%,slug.ilike.%${location}%`);

    if (locationRows && locationRows.length > 0) {
      locationIds = locationRows.map((l) => l.id);
    } else {
      return { data: [], count: 0, totalPages: 0, page, perPage: per_page };
    }
  }

  const filterArgs = { transaction_type, property_type, bedrooms, min_price, max_price, keyword, locationIds };

  // Step 1: Get total count (HEAD request — no body transferred)
  const countQuery = applyPropertyFilters(
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    filterArgs
  );
  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error('Error counting properties:', countError.message);
    return { data: [], count: 0, totalPages: 0, page, perPage: per_page };
  }

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / per_page);

  // Step 2: Check if requested page is within bounds
  if (totalCount === 0 || page > totalPages || page < 1) {
    return { data: [], count: totalCount, totalPages, page, perPage: per_page };
  }

  // Step 3: Fetch data with range (page is guaranteed valid)
  const from = (page - 1) * per_page;
  const to = from + per_page - 1;

  let dataQuery = applyPropertyFilters(
    supabase.from('properties').select(`
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
      created_at,
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
    `),
    filterArgs
  );

  // Sorting
  if (sort === 'price_asc') {
    dataQuery = dataQuery.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    dataQuery = dataQuery.order('price', { ascending: false });
  } else {
    dataQuery = dataQuery.order('published_at', { ascending: false });
  }

  dataQuery = dataQuery.range(from, to);

  const { data, error } = await dataQuery;

  if (error) {
    console.error('Error fetching properties:', error.message);
    return { data: [], count: totalCount, totalPages, page, perPage: per_page };
  }

  return { data: data ?? [], count: totalCount, totalPages, page, perPage: per_page };
}
