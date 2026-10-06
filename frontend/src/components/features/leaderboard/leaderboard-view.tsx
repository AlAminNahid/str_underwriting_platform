"use client";

import { TrophyIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LoadError } from "@/components/features/shared/load-error";
import { PropertyCell } from "@/components/features/shared/property-cell";
import { ScoreBadge } from "@/components/features/shared/score-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { useDashboard } from "@/hooks/use-dashboard";
import { useRankedAttempts } from "@/hooks/use-submission";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TrainingCase } from "@/types/training";

const PODIUM = 3;

export function LeaderboardView() {
  const router = useRouter();
  const ranked = useRankedAttempts();
  const dashboard = useDashboard();
  const cases = dashboard.data?.cases ?? [];
  const caseFor = (zpid: string) => cases.find((c) => c.zpid === zpid);

  if (ranked.isPending) return <LeaderboardSkeleton />;

  if (ranked.error) {
    return (
      <Card className="py-0" data-testid="leaderboard-error">
        <LoadError
          title="We couldn't load the leaderboard"
          error={ranked.error}
          onRetry={() => ranked.refetch()}
          isRetrying={ranked.isRefetching}
        />
      </Card>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="min-w-0 gap-0 py-0" data-testid="leaderboard">
        {ranked.data.length === 0 ? (
          <EmptyState
            icon={TrophyIcon}
            title="No graded attempts yet"
            description="Submit an underwriting and your score will be ranked here."
            action={
              <Link
                href={ROUTES.dashboard}
                className={buttonVariants({ size: "lg" })}
              >
                Pick a training case
              </Link>
            }
          />
        ) : (
          <Table className="min-w-[640px]">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-16 pl-5">Rank</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Your Mid</TableHead>
                <TableHead className="text-right">Off by</TableHead>
                <TableHead className="pr-5">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.data.map((a, i) => {
                const trainingCase = caseFor(a.zpid);
                return (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer"
                    onClick={() => router.push(ROUTES.submission(a.id))}
                    data-testid="leaderboard-row"
                  >
                    <TableCell className="pl-5">
                      <span
                        className={cn(
                          "inline-grid size-7 place-items-center rounded-full text-xs font-semibold tabular-nums",
                          i < PODIUM
                            ? "bg-gold/15 text-gold-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {i + 1}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-72">
                      <Link
                        href={ROUTES.submission(a.id)}
                        className="block rounded-md hover:[&_.font-medium]:underline hover:[&_.font-medium]:underline-offset-4"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Rank ${i + 1}: open result for ${trainingCase?.street ?? a.zpid}`}
                      >
                        <PropertyCell
                          zpid={a.zpid}
                          trainingCase={trainingCase}
                        />
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                      {formatDate(a.submittedAt)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(a.midForecast)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {a.midForecast === null
                        ? "—"
                        : formatPercent(a.deviation)}
                    </TableCell>
                    <TableCell className="pr-5">
                      <ScoreBadge score={a.score} className="shadow-none" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <BestByProperty cases={cases} loading={dashboard.isPending} />
    </div>
  );
}

function BestByProperty({
  cases,
  loading,
}: {
  cases: TrainingCase[];
  loading: boolean;
}) {
  return (
    <Card className="gap-0 pb-0" data-testid="best-by-property">
      <CardHeader className="border-b">
        <CardTitle>Best score by property</CardTitle>
        <CardDescription>
          Your highest score on each training case
        </CardDescription>
      </CardHeader>
      {loading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <ul className="divide-y">
          {cases.map((c) => (
            <li key={c.zpid}>
              <Link
                href={ROUTES.property(c.zpid)}
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/60"
              >
                <span className="min-w-0 flex-1">
                  <PropertyCell zpid={c.zpid} trainingCase={c} />
                </span>
                {c.bestScore ? (
                  <ScoreBadge score={c.bestScore} className="shadow-none" />
                ) : (
                  <span className="text-xs whitespace-nowrap text-muted-foreground">
                    Not attempted
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function LeaderboardSkeleton() {
  return (
    <div
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      aria-busy="true"
      aria-label="Loading leaderboard"
    >
      <Card className="space-y-3 p-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </Card>
      <Card className="space-y-3 p-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    </div>
  );
}
