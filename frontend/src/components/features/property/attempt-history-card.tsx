import { ChevronRightIcon, FileClockIcon } from "lucide-react";
import Link from "next/link";

import { ScoreBadge } from "@/components/features/shared/score-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  pluralize,
} from "@/lib/format";
import type { Attempt } from "@/types/training";

export function AttemptHistoryCard({
  attempts,
  loading,
  failed,
  onRetry,
}: {
  attempts: Attempt[] | undefined;
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}) {
  return (
    <Card className="gap-0 pb-0" data-testid="attempt-history">
      <CardHeader className="border-b">
        <CardTitle>Attempt history</CardTitle>
        <CardDescription>
          {attempts?.length
            ? `${pluralize(attempts.length, "graded attempt")}, newest first`
            : "Your graded attempts on this property"}
        </CardDescription>
      </CardHeader>

      {loading ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : failed ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span className="text-muted-foreground">
            We couldn&apos;t load your attempts.
          </span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : !attempts?.length ? (
        <EmptyState
          icon={FileClockIcon}
          title="No attempts yet"
          description="Your attempts will be listed here after you submit."
          className="py-10"
        />
      ) : (
        <ol className="divide-y">
          {attempts.map((a, index) => (
            <li key={a.id}>
              <Link
                href={ROUTES.submission(a.id)}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <span className="w-7 text-xs font-semibold text-muted-foreground tabular-nums">
                  #{attempts.length - index}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium tabular-nums">
                    Mid {formatCurrency(a.midForecast)}
                  </span>
                  <span className="block text-xs text-muted-foreground tabular-nums">
                    {formatDate(a.submittedAt)} · {formatPercent(a.deviation)}{" "}
                    off
                  </span>
                </span>
                <ScoreBadge score={a.score} className="shadow-none" />
                <ChevronRightIcon
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
