import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { CASE_GRID_CLASS } from "./case-grid";

export function CaseGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={CASE_GRID_CLASS}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
        >
          <Skeleton className="aspect-video rounded-none" />
          <div className="space-y-2.5 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="mt-4 h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard"
      data-testid="dashboard-loading"
    >
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="gap-3 px-5 py-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
      <Card className="gap-0 py-0">
        <div className="space-y-2 px-5 py-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="border-y px-4 py-3">
          <Skeleton className="h-9 w-full max-w-md" />
        </div>
        <div className="p-4">
          <CaseGridSkeleton />
        </div>
      </Card>
    </div>
  );
}
