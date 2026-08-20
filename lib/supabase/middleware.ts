import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  apiBodyLimitForPath,
  contentLengthExceedsLimit,
} from '@/lib/api-request-size';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Reject browser cross-site mutations before cookie-backed auth is evaluated. */
function crossSiteMutationResponse(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith('/api/') || SAFE_METHODS.has(request.method)) {
    return null;
  }

  const bodyLimit = apiBodyLimitForPath(request.nextUrl.pathname);
  if (contentLengthExceedsLimit(request.headers, bodyLimit)) {
    return NextResponse.json({ error: 'Request body too large.' }, { status: 413 });
  }

  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'Cross-site request blocked' }, { status: 403 });
  }

  const origin = request.headers.get('origin');
  if (!origin) return null;

  try {
    if (new URL(origin).origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: 'Cross-site request blocked' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Cross-site request blocked' }, { status: 403 });
  }

  return null;
}

// Middleware helper for authentication
export async function updateSession(request: NextRequest) {
  const crossSiteResponse = crossSiteMutationResponse(request);
  if (crossSiteResponse) return crossSiteResponse;

  // Expose the real request path to Server Components (the root layout
  // hides public chrome on /admin routes). Set unconditionally so a
  // client-supplied header value is always overwritten.
  request.headers.set('x-current-path', request.nextUrl.pathname);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const copyRefreshedCookies = (target: NextResponse) => {
    for (const cookie of response.cookies.getAll()) {
      target.cookies.set(cookie);
    }
    return target;
  };

  // Keep private favorites out of streamed page shells as well as database
  // results. The page-level redirect remains as defense in depth.
  if (request.nextUrl.pathname === '/favorites' && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    loginUrl.searchParams.set('next', '/favorites');
    return copyRefreshedCookies(NextResponse.redirect(loginUrl));
  }

  // Layouts and pages can render in parallel in the App Router. Enforce the
  // admin boundary here so an unauthorized request never starts rendering an
  // admin child page (and therefore cannot receive admin data in an RSC stream).
  const isAdminPath = request.nextUrl.pathname === '/admin'
    || request.nextUrl.pathname.startsWith('/admin/');
  if (isAdminPath) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = '';
      loginUrl.searchParams.set(
        'next',
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      );
      return copyRefreshedCookies(NextResponse.redirect(loginUrl));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      const deniedUrl = request.nextUrl.clone();
      deniedUrl.pathname = '/access-denied';
      deniedUrl.search = '';
      return copyRefreshedCookies(NextResponse.redirect(deniedUrl));
    }
  }

  return response;
}
