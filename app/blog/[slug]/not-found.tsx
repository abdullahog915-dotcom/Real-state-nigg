import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogPostNotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Newspaper className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Article Not Found</h1>
      <p className="max-w-md text-muted-foreground mb-6">
        The article you are looking for does not exist or is no longer published.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/blog">Browse All Articles</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
