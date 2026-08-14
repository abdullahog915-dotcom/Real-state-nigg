'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold mb-3">Something Went Wrong</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        We couldn&apos;t load the homepage. This might be a temporary issue.
        Please try again.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          Reload Page
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && error.message && (
        <pre className="mt-8 mx-auto max-w-lg rounded-lg bg-muted p-4 text-left text-xs overflow-auto">
          {error.message}
        </pre>
      )}
    </div>
  );
}
