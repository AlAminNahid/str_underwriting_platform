"use client";

import { ChevronRightIcon, FileClockIcon, HouseIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { LoadError } from "@/components/features/shared/load-error";
import { PropertyCell } from "@/components/features/shared/property-cell";
import { ScoreBadge } from "@/components/features/shared/score-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { RATING_TEXT } from "@/constants/scoring";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAllAttempts } from "@/hooks/use-submission";
import { formatCurrency, formatDateTime, pluralize } from "@/lib/format";
import { formatSignedDeviation } from "@/lib/score";
import { cn } from "@/lib/utils";

const ALL = "all";

export function SubmissionsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const attempts = useAllAttempts();
  const dashboard = useDashboard();

  if (attempts.isPending) return <SubmissionsSkeleton />;

  if (attempts.error) {
    return (
      <Card className="py-0" data-testid="submissions-error">
        <LoadError
          title="We couldn't load your submissions"
          error={attempts.error}
          onRetry={() => attempts.refetch()}
          isRetrying={attempts.isRefetching}
        />
      </Card>
    );
  }

  const all = attempts.data;
  if (all.length === 0) {
    return (
      <Card className="py-0" data-testid="submissions-empty">
        <EmptyState
          icon={FileClockIcon}
          title="No submissions yet"
          description="Graded attempts appear here after you submit an underwriting."
          action={
            <Link
              href={ROUTES.dashboard}
              className={buttonVariants({ size: "lg" })}
            >
              Pick a training case
            </Link>
          }
        />
      </Card>
    );
  }

  const cases = dashboard.data?.cases ?? [];
  const caseFor = (zpid: string) => cases.find((c) => c.zpid === zpid);

  const propertyItems = [
    { value: ALL, label: "All properties" },
    ...[...new Set(all.map((a) => a.zpid))]
      .map((zpid) => ({
        value: zpid,
        label: caseFor(zpid)?.street ?? `Property ${zpid}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
  const requested = searchParams.get("property");
  const selected = propertyItems.some((i) => i.value === requested)
    ? (requested as string)
    : ALL;
  const visible =
    selected === ALL ? all : all.filter((a) => a.zpid === selected);

  function selectProperty(value: string) {
    router.replace(value === ALL ? pathname : `${pathname}?property=${value}`, {
      scroll: false,
    });
  }

  return (
    <Card className="gap-0 py-0" data-testid="submissions">
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
        <p
          className="text-sm text-muted-foreground"
          data-testid="submissions-count"
        >
          {pluralize(visible.length, "submission")}
        </p>
        <Select
          items={propertyItems}
          value={selected}
          onValueChange={(value) =>
            selectProperty((value as string | null) ?? ALL)
          }
        >
          <SelectTrigger
            className="ml-auto h-9! w-full bg-card shadow-xs sm:w-60"
            aria-label="Filter by property"
            data-testid="property-filter"
          >
            <HouseIcon className="text-muted-foreground" aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            align="end"
            className="min-w-60"
          >
            {propertyItems.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table className="min-w-[760px]">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="pl-5">Submitted</TableHead>
            <TableHead>Property</TableHead>
            <TableHead className="text-right">Your Mid</TableHead>
            <TableHead className="text-right">Analyst reference</TableHead>
            <TableHead className="text-right">Deviation</TableHead>
            <TableHead>Score</TableHead>
            <TableHead className="w-10 pr-5">
              <span className="sr-only">Open result</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((a) => {
            const trainingCase = caseFor(a.zpid);
            return (
              <TableRow
                key={a.id}
                className="cursor-pointer"
                onClick={() => router.push(ROUTES.submission(a.id))}
                data-testid="submission-row"
              >
                <TableCell className="pl-5 whitespace-nowrap text-muted-foreground tabular-nums">
                  {formatDateTime(a.submittedAt)}
                </TableCell>
                <TableCell className="max-w-72">
                  <Link
                    href={ROUTES.submission(a.id)}
                    className="block rounded-md hover:[&_.font-medium]:underline hover:[&_.font-medium]:underline-offset-4"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open result for ${trainingCase?.street ?? a.zpid}, submitted ${formatDateTime(a.submittedAt)}`}
                  >
                    <PropertyCell zpid={a.zpid} trainingCase={trainingCase} />
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(a.midForecast)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {formatCurrency(a.referenceMid)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    RATING_TEXT[a.score.rating],
                  )}
                >
                  {formatSignedDeviation(a)}
                </TableCell>
                <TableCell>
                  <ScoreBadge score={a.score} className="shadow-none" />
                </TableCell>
                <TableCell className="pr-5 text-muted-foreground">
                  <ChevronRightIcon className="size-4" aria-hidden />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

export function SubmissionsSkeleton() {
  return (
    <Card
      className="gap-0 py-0"
      aria-busy="true"
      aria-label="Loading submissions"
    >
      <div className="flex items-center justify-between border-b px-5 py-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-60" />
      </div>
      <div className="space-y-3 p-5">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </Card>
  );
}
