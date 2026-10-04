import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PropertySkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading property"
      data-testid="property-loading"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-44" />
        </div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Skeleton className="aspect-[21/8] w-full rounded-xl" />
          <Card className="gap-3 px-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-72" />
            <div className="grid gap-4 pt-2 sm:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="gap-3 px-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </Card>
          <Card className="gap-3 px-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}
