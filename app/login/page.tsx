import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/lib/supabase/server';
import { getSafeRedirectPath } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to save favorite properties and manage your viewing requests.',
};

/** Only known error keys map to user-facing messages — never reflect raw input. */
const ERROR_MESSAGES: Record<string, string> = {
  callback: "We couldn't verify your account. Please sign in again.",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const safeNext = getSafeRedirectPath(params.next);

  // Already signed in — no need to show the login form.
  const user = await getUser();
  if (user) {
    redirect(safeNext ?? '/');
  }

  const banner = params.error
    ? ERROR_MESSAGES[params.error] ?? 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="container mx-auto py-12 lg:py-16">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Welcome back. Sign in to access your saved properties.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {banner && (
              <p role="alert" className="text-sm text-destructive">
                {banner}
              </p>
            )}

            <LoginForm next={safeNext} />

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href={safeNext ? `/signup?next=${encodeURIComponent(safeNext)}` : '/signup'}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
