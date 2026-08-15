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

/**
 * Columns selected for property card listings (favorites page).
 * Matches the fields consumed by PropertyCard.
 */
const PROPERTY_CARD_COLUMNS = `
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
`;

/**
 * Get the current user's favorited property IDs, newest favorite first.
 * Returns an empty array for signed-out visitors.
 */
export async function getFavoritePropertyIds(): Promise<string[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('property_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorite property ids:', error.message);
    return [];
  }

  return data?.map((favorite) => favorite.property_id) ?? [];
}

/**
 * Get the current user's favorited properties, newest favorite first.
 * Only published/featured properties are returned — the inner join plus
 * status filter drops favorites pointing at unpublished or removed listings.
 */
export async function getFavoriteProperties(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('favorites')
    .select(
      `
      created_at,
      properties!inner (
        ${PROPERTY_CARD_COLUMNS}
      )
    `
    )
    .eq('user_id', userId)
    .in('properties.status', ['published', 'featured'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorite properties:', error.message);
    return [];
  }

  // Supabase may return joined single relations as arrays depending on FK inference
  return (data ?? [])
    .map((favorite) =>
      Array.isArray(favorite.properties) ? favorite.properties[0] : favorite.properties
    )
    .filter((property): property is NonNullable<typeof property> => property != null);
}

/**
 * Columns selected for property detail queries.
 * Shared between detail and related property queries.
 */
const PROPERTY_DETAIL_COLUMNS = `
  id,
  title,
  slug,
  description,
  property_id,
  property_type,
  transaction_type,
  status,
  price,
  currency,
  bedrooms,
  bathrooms,
  toilets,
  area,
  lot_size,
  year_built,
  parking_spaces,
  floors,
  is_furnished,
  featured_image,
  gallery_images,
  is_featured,
  address,
  latitude,
  longitude,
  meta_title,
  meta_description,
  og_image,
  published_at,
  created_at,
  location_id,
  agent_id,
  locations (
    id,
    name,
    slug,
    city,
    state,
    country
  ),
  agents (
    id,
    name,
    slug,
    email,
    phone,
    whatsapp,
    bio,
    photo_url,
    specialization,
    locations
  )
`;

/**
 * Get a single publicly visible property by slug with all detail relations.
 * Returns null when the slug does not match a published/featured property.
 */
export async function getPropertyBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('properties')
    .select(`
      ${PROPERTY_DETAIL_COLUMNS},
      property_images (
        id,
        url,
        alt_text,
        display_order,
        is_featured
      ),
      property_amenities (
        amenities (
          id,
          name,
          slug,
          icon,
          category
        )
      )
    `)
    .eq('slug', slug)
    .in('status', ['published', 'featured'])
    .maybeSingle();

  if (error) {
    // PGRST116 (row not found) is expected for unknown slugs — do not log loudly
    if (error.code !== 'PGRST116') {
      console.error('Error fetching property by slug:', error.message);
    }
    return null;
  }

  return data;
}

/**
 * Get properties related to the current one.
 * Prefers same location, then fills with same transaction type.
 */
export async function getRelatedProperties(
  excludeId: string,
  opts: { location_id?: string | null; transaction_type?: string },
  limit = 3
) {
  const supabase = await createClient();
  const results: Record<string, unknown>[] = [];
  const seenIds = new Set<string>([excludeId]);

  // Prefer properties in the same location
  if (opts.location_id) {
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_DETAIL_COLUMNS)
      .in('status', ['published', 'featured'])
      .eq('location_id', opts.location_id)
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      for (const row of data) {
        results.push(row);
        seenIds.add(row.id as string);
      }
    } else if (error) {
      console.error('Error fetching related properties by location:', error.message);
    }
  }

  // Fill remaining slots with same transaction type
  if (results.length < limit && opts.transaction_type) {
    const remaining = limit - results.length;
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_DETAIL_COLUMNS)
      .in('status', ['published', 'featured'])
      .eq('transaction_type', opts.transaction_type)
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(remaining + seenIds.size);

    if (!error && data) {
      for (const row of data) {
        if (results.length >= limit) break;
        if (!seenIds.has(row.id as string)) {
          results.push(row);
          seenIds.add(row.id as string);
        }
      }
    } else if (error) {
      console.error('Error fetching related properties by transaction type:', error.message);
    }
  }

  return results.slice(0, limit);
}

/**
 * Get all active agents for the agents listing page.
 * RLS only exposes agents with is_active = true.
 * Optional keyword filters by name (PostgREST ilike cannot target the
 * text[] specialization/locations columns).
 */
export async function getAgents(keyword?: string) {
  const supabase = await createClient();

  let query = supabase
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
      display_order
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (keyword) {
    query = query.ilike('name', `%${keyword}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching agents:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Get all locations for the locations listing page.
 * Includes a count of publicly visible properties per location.
 * RLS allows public SELECT on locations without restrictions.
 */
export async function getLocations() {
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
      display_order,
      properties (
        id,
        status
      )
    `)
    .in('properties.status', ['published', 'featured'])
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching locations:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Get a single location by slug.
 * Returns null when the slug does not match any location.
 */
export async function getLocationBySlug(slug: string) {
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
      display_order,
      created_at
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    // PGRST116 (row not found) is expected for unknown slugs
    if (error.code !== 'PGRST116') {
      console.error('Error fetching location by slug:', error.message);
    }
    return null;
  }

  return data;
}

/**
 * Get publicly visible properties in a location.
 */
export async function getLocationProperties(locationId: string, limit = 12) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('properties')
    .select(PROPERTY_DETAIL_COLUMNS)
    .eq('location_id', locationId)
    .in('status', ['published', 'featured'])
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching location properties:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Get publicly visible properties by slug for the comparison page.
 * Returns rows in the same order as the requested slugs; unknown or
 * non-public slugs are omitted. Empty input returns an empty list
 * without touching the database.
 */
export async function getPropertiesForComparison(slugs: string[]) {
  if (slugs.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('properties')
    .select(`
      ${PROPERTY_DETAIL_COLUMNS},
      property_amenities (
        amenities (
          id,
          name
        )
      )
    `)
    .in('slug', slugs)
    .in('status', ['published', 'featured']);

  if (error) {
    console.error('Error fetching comparison properties:', error.message);
    return [];
  }

  // Preserve the requested slug order
  const bySlug = new Map((data ?? []).map((row) => [row.slug, row]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((row): row is NonNullable<typeof row> => row != null);
}

/**
 * Columns selected for blog post cards and detail pages.
 */
const BLOG_POST_COLUMNS = `
  id,
  title,
  slug,
  content,
  excerpt,
  featured_image,
  status,
  meta_title,
  meta_description,
  published_at,
  blog_categories (
    id,
    name,
    slug
  )
`;

export interface BlogListFilters {
  category?: string;
  page?: number;
  per_page?: number;
}

/**
 * Get published blog posts with count-first pagination.
 * RLS only exposes posts with status = 'published'.
 * Category filter resolves the category slug to its id first.
 */
export async function getBlogPosts(filters: BlogListFilters = {}) {
  const { category, page = 1, per_page = 9 } = filters;
  const supabase = await createClient();

  // Resolve category slug to id (unknown category → empty result)
  let categoryId: string | undefined;
  if (category) {
    const { data: categoryRow } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', category)
      .maybeSingle();

    if (!categoryRow) {
      return { data: [], count: 0, totalPages: 0, page, perPage: per_page };
    }
    categoryId = categoryRow.id;
  }

  // Build the count query (HEAD request).
  // Uses `any` for the PostgREST builder type because Supabase's
  // generic chain types are not expressible as a standalone variable.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let countQuery: any = supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');
  if (categoryId) {
    countQuery = countQuery.eq('category_id', categoryId);
  }

  // Step 1: Get total count (HEAD request — no body transferred)
  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error('Error counting blog posts:', countError.message);
    return { data: [], count: 0, totalPages: 0, page, perPage: per_page };
  }

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / per_page);

  // Step 2: Check bounds — return empty if out of range (prevents PostgREST 416)
  if (totalCount === 0 || page > totalPages || page < 1) {
    return { data: [], count: totalCount, totalPages, page, perPage: per_page };
  }

  // Step 3: Fetch data with range (page guaranteed valid)
  const from = (page - 1) * per_page;
  const to = from + per_page - 1;

  let dataQuery = supabase
    .from('blog_posts')
    .select(BLOG_POST_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (categoryId) {
    dataQuery = dataQuery.eq('category_id', categoryId);
  }

  const { data, error } = await dataQuery.range(from, to);

  if (error) {
    console.error('Error fetching blog posts:', error.message);
    return { data: [], count: totalCount, totalPages, page, perPage: per_page };
  }

  return { data: data ?? [], count: totalCount, totalPages, page, perPage: per_page };
}

/**
 * Get all blog categories ordered for display.
 */
export async function getBlogCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_categories')
    .select('id, name, slug, description')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching blog categories:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Get a single published blog post by slug.
 * Returns null when the slug does not match a published post.
 */
export async function getBlogPostBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(BLOG_POST_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    // PGRST116 (row not found) is expected for unknown slugs
    if (error.code !== 'PGRST116') {
      console.error('Error fetching blog post by slug:', error.message);
    }
    return null;
  }

  return data;
}

/**
 * Get recent published blog posts, preferring the same category.
 */
export async function getRelatedBlogPosts(
  excludeId: string,
  categoryId: string | null | undefined,
  limit = 3
) {
  const supabase = await createClient();
  const results: NonNullable<Awaited<ReturnType<typeof getBlogPosts>>['data']> = [];
  const seenIds = new Set<string>();

  // Prefer posts in the same category
  if (categoryId) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(BLOG_POST_COLUMNS)
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      for (const row of data) {
        results.push(row);
        seenIds.add(row.id as string);
      }
    }
  }

  // Fill remaining slots with recent posts from any category
  if (results.length < limit) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(BLOG_POST_COLUMNS)
      .eq('status', 'published')
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      for (const row of data) {
        if (!seenIds.has(row.id as string)) {
          results.push(row);
          seenIds.add(row.id as string);
        }
      }
    } else if (error) {
      console.error('Error fetching related blog posts:', error.message);
    }
  }

  return results.slice(0, limit);
}

/**
 * Get a single active agent by slug.
 * Returns null when the slug does not match an active agent.
 */
export async function getAgentBySlug(slug: string) {
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
      display_order,
      created_at
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    // PGRST116 (row not found) is expected for unknown slugs
    if (error.code !== 'PGRST116') {
      console.error('Error fetching agent by slug:', error.message);
    }
    return null;
  }

  return data;
}

/**
 * Get publicly visible properties assigned to an agent.
 */
export async function getAgentProperties(agentId: string, limit = 12) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('properties')
    .select(PROPERTY_DETAIL_COLUMNS)
    .eq('agent_id', agentId)
    .in('status', ['published', 'featured'])
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching agent properties:', error.message);
    return [];
  }

  return data ?? [];
}
