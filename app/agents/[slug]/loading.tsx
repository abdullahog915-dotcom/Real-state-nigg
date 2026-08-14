import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function AgentDetailLoading() {
  return (
    <>
      {/* Breadcrumb skeleton */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main column skeleton */}
          <div className="min-w-0">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Skeleton className="mx-auto h-32 w-32 shrink-0 rounded-full sm:mx-0" />
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <Skeleton className="mx-auto h-8 w-52 sm:mx-0" />
                <Skeleton className="mx-auto h-5 w-64 sm:mx-0" />
                <Skeleton className="mx-auto h-4 w-40 sm:mx-0" />
              </div>
            </div>

            <Skeleton className="mt-8 h-5 w-48" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />

            <Skeleton className="mt-8 h-5 w-56" />
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <aside>
            <Card className="gap-0 py-0">
              <CardContent className="space-y-4 pt-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
