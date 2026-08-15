import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AccessDenied } from '@/components/admin/AccessDenied';
import { Toaster } from '@/components/ui/sonner';
import { getUser, isAdmin } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin Dashboard',
  },
  // Admin screens must never be indexed
  robots: { index: false, follow: false },
};

/**
 * Server-side authorization gate for every /admin route.
 *
 * - Anonymous visitors are redirected to /login with a return path.
 * - Authenticated non-admins get a minimal Access Denied screen —
 *   no admin data, navigation, or structure is rendered for them.
 * - Only authenticated admins receive the admin shell.
 *
 * API routes under /api/admin enforce the same check independently
 * via adminApiGuard().
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect('/login?next=/admin');
  }

  const admin = await isAdmin();
  if (!admin) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="px-4 py-6 sm:px-6 lg:pl-[17rem] lg:pr-6">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
