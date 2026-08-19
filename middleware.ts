import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Intentionally retain the Edge middleware convention: Next.js 16 proxy.ts is
// Node-runtime-only, which OpenNext for Cloudflare 1.20.2 does not yet support.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
