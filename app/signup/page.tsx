import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/lib/supabase/server';
import { getSafeRedirectPath } from '@/lib/redirects';
import { SignupForm } from '@/components/auth/SignupForm';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Create Account',
  description:
    'Create a free account to save favorite properties and manage your viewing requests.',
  path: '/signup',
  noIndex: true,
});

interface SignupPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  const safeNext = getSafeRedirectPath(params.next);

  // Already signed in — no need to show the signup form.
  const user = await getUser();
  if (user) {
    redirect(safeNext ?? '/');
  }

  return (
    <div className="container mx-auto py-12 lg:py-16">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Sign up to save your favorite properties and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignupForm next={safeNext} />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href={safeNext ? `/login?next=${encodeURIComponent(safeNext)}` : '/login'}
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
