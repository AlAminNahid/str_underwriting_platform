import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading underwriting"
      data-testid="workspace-loading"
    >
      <div className="mb-6 space-y-2.5">
        <Skeleton className="h-7 w-80" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="mb-6 h-10 w-full max-w-xl" />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <Card key={i} className="gap-4 px-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-72" />
              <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 6 }, (_, j) => (
                  <Skeleton key={j} className="h-9 w-full" />
                ))}
              </div>
            </Card>
          ))}
        </div>
        <Card className="gap-3 px-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-20 w-full" />
        </Card>
      </div>
    </div>
  );
}
