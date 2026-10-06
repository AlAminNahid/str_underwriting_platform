import { ScoreBadge } from "@/components/features/shared/score-badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Attempt, TrainingCase } from "@/types/training";

const TOP = 6;

export function LeaderboardCard({
  ranked,
  currentId,
  cases,
  loading,
}: {
  ranked: Attempt[] | undefined;
  currentId: number;
  cases: TrainingCase[];
  loading: boolean;
}) {
  const position = ranked ? ranked.findIndex((a) => a.id === currentId) + 1 : 0;
  const rows = ranked?.slice(0, TOP) ?? [];
  const showCurrent = ranked && position > TOP ? ranked[position - 1] : null;
  const street = (zpid: string) =>
    cases.find((c) => c.zpid === zpid)?.street ?? `Property ${zpid}`;

  const row = (a: Attempt, rank: number) => (
    <li
      key={a.id}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5",
        a.id === currentId && "bg-gold/10",
      )}
    >
      <span className="w-5 text-xs font-semibold text-muted-foreground tabular-nums">
        {rank}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          {street(a.zpid)}
        </span>
        <span className="block text-xs text-muted-foreground tabular-nums">
          {a.id === currentId ? "This attempt" : formatDate(a.submittedAt)} ·{" "}
          {formatPercent(a.deviation)} off
        </span>
      </span>
      <ScoreBadge score={a.score} className="shadow-none" />
    </li>
  );

  return (
    <Card className="gap-0 pb-0" data-testid="result-leaderboard">
      <CardHeader className="border-b">
        <CardTitle>Your leaderboard</CardTitle>
        <CardDescription>
          {position > 0 && ranked
            ? `This attempt is #${position} of your ${ranked.length} graded attempts, across all properties`
            : "Your graded attempts across all properties, best first"}
        </CardDescription>
      </CardHeader>
      {loading ? (
        <div className="space-y-2 p-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : (
        <ol className="divide-y">
          {rows.map((a, i) => row(a, i + 1))}
          {showCurrent && row(showCurrent, position)}
        </ol>
      )}
    </Card>
  );
}
