import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ResultSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading result"
      data-testid="result-loading"
    >
      <div className="mb-6 space-y-2.5">
        <Skeleton className="h-7 w-60" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="flex-row gap-6 p-6">
            <Skeleton className="size-[132px] rounded-full" />
            <div className="flex-1 space-y-3 pt-4">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}
