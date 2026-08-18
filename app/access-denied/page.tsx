import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Access Denied',
  description: 'You do not have permission to access the requested page.',
  robots: { index: false, follow: false },
};

export default function AccessDeniedPage() {
  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <ShieldX className="h-12 w-12 text-destructive" aria-hidden="true" />
      <h1 className="mt-5 text-3xl font-bold tracking-tight">Access denied</h1>
      <p className="mt-3 text-muted-foreground">
        Your account does not have permission to access the admin dashboard.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Return Home</Link>
      </Button>
    </main>
  );
}
