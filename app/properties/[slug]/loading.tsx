import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function PropertyDetailLoading() {
  return (
    <>
      {/* Breadcrumb skeleton */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main column skeleton */}
          <div className="min-w-0">
            <Skeleton className="aspect-[4/3] w-full rounded-lg lg:aspect-[16/9]" />
            <Skeleton className="mt-6 h-6 w-48" />
            <Skeleton className="mt-3 h-8 w-3/4" />
            <Skeleton className="mt-3 h-5 w-56" />
            <Skeleton className="mt-4 h-9 w-44" />

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>

            <Skeleton className="mt-8 h-5 w-52" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>

          {/* Sidebar skeleton */}
          <aside className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-10 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 pt-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
