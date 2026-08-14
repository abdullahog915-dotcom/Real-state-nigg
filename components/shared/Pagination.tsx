import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildPageUrl: (page: number) => string;
}

export function Pagination({ currentPage, totalPages, buildPageUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const pages: (number | '...')[] = [];
  const delta = 2; // pages around current

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {/* Previous */}
      {currentPage > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={buildPageUrl(currentPage - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            asChild={page !== currentPage}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'min-w-[36px]',
              page === currentPage && 'pointer-events-none'
            )}
          >
            {page === currentPage ? (
              <span aria-current="page">{page}</span>
            ) : (
              <Link href={buildPageUrl(page)}>{page}</Link>
            )}
          </Button>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link href={buildPageUrl(currentPage + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}
