"use client";

import {
  ArrowRightIcon,
  FileQuestionIcon,
  InfoIcon,
  RotateCcwIcon,
} from "lucide-react";
import Link from "next/link";

import { AttemptHistoryCard } from "@/components/features/property/attempt-history-card";
import { ScoreBadge } from "@/components/features/shared/score-badge";
import { LoadError } from "@/components/features/shared/load-error";
import { PageBreadcrumbs } from "@/components/layouts/breadcrumbs";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";
import { useDashboard } from "@/hooks/use-dashboard";
import { useProperty, usePropertyAttempts } from "@/hooks/use-property";
import { useRankedAttempts, useSubmission } from "@/hooks/use-submission";
import { formatDateTime } from "@/lib/format";
import { rankOf } from "@/lib/leaderboard";
import { explainScore } from "@/lib/score-explanation";
import { ApiError } from "@/services/api-client";

import { BandChart } from "./band-chart";
import { LeaderboardCard } from "./leaderboard-card";
import { ResultSkeleton } from "./result-skeleton";
import { ScoreHero } from "./score-hero";

export function ResultView({ id }: { id: number }) {
  const submission = useSubmission(id);
  const attempt = submission.data;
  const zpid = attempt?.zpid ?? "";
  const property = useProperty(zpid);
  const history = usePropertyAttempts(zpid);
  const ranked = useRankedAttempts();
  const dashboard = useDashboard();

  const street = property.data?.street ?? "Property";
  const crumbs = [
    { label: "Dashboard", href: ROUTES.dashboard },
    ...(zpid ? [{ label: street, href: ROUTES.property(zpid) }] : []),
    { label: "Result" },
  ];

  const invalidId = !Number.isInteger(id) || id <= 0;
  if (
    invalidId ||
    (submission.error instanceof ApiError && submission.error.status === 404)
  ) {
    return (
      <>
        <PageBreadcrumbs items={crumbs} />
        <Card className="py-0">
          <EmptyState
            icon={FileQuestionIcon}
            title="We couldn't find this result"
            description="The link may be wrong, or the submission no longer exists."
            action={
              <Link
                href={ROUTES.dashboard}
                className={buttonVariants({ size: "lg" })}
              >
                Back to dashboard
              </Link>
            }
            data-testid="result-not-found"
          />
        </Card>
      </>
    );
  }

  if (submission.isPending) {
    return (
      <>
        <PageBreadcrumbs items={crumbs} />
        <ResultSkeleton />
      </>
    );
  }

  if (submission.error || !attempt) {
    return (
      <>
        <PageBreadcrumbs items={crumbs} />
        <Card className="py-0">
          <LoadError
            title="We couldn't load this result"
            error={submission.error}
            onRetry={() => submission.refetch()}
            isRetrying={submission.isRefetching}
            data-testid="result-error"
          />
        </Card>
      </>
    );
  }

  const explanation = explainScore(attempt);
  const attempts = history.data ?? [];
  const index = attempts.findIndex((a) => a.id === attempt.id);
  const attemptNumber = index === -1 ? null : attempts.length - index;
  const previous = index === -1 ? null : (attempts[index + 1] ?? null);
  const position = ranked.data ? rankOf(ranked.data, attempt.id) : null;
  const cases = dashboard.data?.cases ?? [];
  const nextCase = cases.find(
    (c) => c.status === "not_started" && c.zpid !== attempt.zpid,
  );
  const location = [property.data?.city, property.data?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <PageBreadcrumbs items={crumbs} />
      <PageHeader
        title="Evaluation result"
        badge={<ScoreBadge score={attempt.score} />}
        meta={
          <>
            <span>
              {street}
              {location && `, ${location}`}
            </span>
            {attemptNumber !== null && (
              <>
                <span
                  className="size-1 rounded-full bg-muted-foreground/60"
                  aria-hidden
                />
                <span>
                  Attempt {attemptNumber} of {attempts.length}
                </span>
              </>
            )}
            <span
              className="size-1 rounded-full bg-muted-foreground/60"
              aria-hidden
            />
            <span>Submitted {formatDateTime(attempt.submittedAt)}</span>
          </>
        }
        actions={
          <>
            <Link
              href={ROUTES.property(attempt.zpid)}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <RotateCcwIcon data-icon="inline-start" />
              Try again
            </Link>
            <Link
              href={
                nextCase ? ROUTES.property(nextCase.zpid) : ROUTES.dashboard
              }
              className={buttonVariants({ size: "lg" })}
            >
              {nextCase ? "Next case" : "Back to dashboard"}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <ScoreHero
            attempt={attempt}
            explanation={explanation}
            previous={previous}
            rank={
              position && ranked.data
                ? { position, total: ranked.data.length }
                : null
            }
          />
          {attempt.midForecast !== null && attempt.referenceMid !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Where your forecast landed</CardTitle>
                <CardDescription>
                  Your Mid revenue forecast against the scoring bands around the
                  analyst&apos;s reference.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BandChart attempt={attempt} />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>What to look at next</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="flex gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-foreground/80">
                <InfoIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                {explanation.tip}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <LeaderboardCard
            currentId={attempt.id}
            ranked={ranked.data}
            loading={ranked.isPending}
            cases={cases}
          />
          <AttemptHistoryCard
            title="Attempts on this property"
            attempts={history.data}
            loading={history.isPending}
            failed={history.isError}
            onRetry={() => history.refetch()}
            currentId={attempt.id}
          />
        </div>
      </div>
    </>
  );
}
