import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Middleware helper for authentication
export async function updateSession(request: NextRequest) {
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

  // Layouts and pages can render in parallel in the App Router. Enforce the
  // admin boundary here so an unauthorized request never starts rendering an
  // admin child page (and therefore cannot receive admin data in an RSC stream).
  const isAdminPath = request.nextUrl.pathname === '/admin'
    || request.nextUrl.pathname.startsWith('/admin/');
  if (isAdminPath) {
    const copyRefreshedCookies = (target: NextResponse) => {
      for (const cookie of response.cookies.getAll()) {
        target.cookies.set(cookie);
      }
      return target;
    };

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
