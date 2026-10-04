import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { ScoreExplanation } from "@/lib/score-explanation";
import { cn } from "@/lib/utils";
import type { Attempt, Rating } from "@/types/training";

const RING: Record<Rating, string> = {
  best: "stroke-success",
  medium: "stroke-warning",
  low: "stroke-danger",
};
const TEXT: Record<Rating, string> = {
  best: "text-success",
  medium: "text-warning",
  low: "text-danger",
};

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreHero({
  attempt,
  explanation,
  previous,
  rank,
}: {
  attempt: Attempt;
  explanation: ScoreExplanation;
  previous: Attempt | null;
  rank: { position: number; total: number } | null;
}) {
  const { score, midForecast, referenceMid, deviation } = attempt;
  const sign =
    midForecast !== null && referenceMid !== null && midForecast < referenceMid
      ? "−"
      : "+";

  return (
    <Card className="gap-0 py-0" data-testid="score-hero">
      <div className="grid items-center gap-7 p-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div className="relative size-[132px]">
          <svg
            viewBox="0 0 132 132"
            className="size-full -rotate-90"
            aria-hidden
          >
            <circle
              cx={66}
              cy={66}
              r={RADIUS}
              fill="none"
              className="stroke-muted"
              strokeWidth={10}
            />
            <circle
              cx={66}
              cy={66}
              r={RADIUS}
              fill="none"
              className={RING[score.rating]}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${(CIRCUMFERENCE * score.value) / 100} ${CIRCUMFERENCE}`}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p
                className="text-[2.4rem] leading-none font-semibold tracking-tight tabular-nums"
                data-testid="score-value"
              >
                {Math.round(score.value)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">out of 100</p>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Overall score</p>
          <h2 className="mt-1 mb-1.5 text-xl font-semibold tracking-tight">
            {explanation.headline}
          </h2>
          <p
            className="max-w-[62ch] text-foreground/80"
            data-testid="score-explanation"
          >
            {explanation.body}
          </p>
          {previous && (
            <p className="mt-2.5 text-sm text-muted-foreground">
              Previous attempt scored {Math.round(previous.score.value)} at{" "}
              {formatPercent(previous.deviation)} off.{" "}
              {deviation < previous.deviation
                ? "You moved closer to the reference."
                : deviation > previous.deviation
                  ? "This attempt was further from the reference."
                  : "Same distance as before."}
            </p>
          )}
        </div>
      </div>
      <dl className="grid grid-cols-2 border-t sm:grid-cols-4">
        {(
          [
            ["Your Mid forecast", formatCurrency(midForecast), undefined],
            ["Analyst reference", formatCurrency(referenceMid), undefined],
            [
              "Deviation",
              midForecast === null ? "—" : `${sign}${formatPercent(deviation)}`,
              TEXT[score.rating],
            ],
            [
              "Leaderboard",
              rank ? `#${rank.position}` : "—",
              undefined,
              rank ? `of ${rank.total}` : undefined,
            ],
          ] as [string, string, string | undefined, string?][]
        ).map(([label, value, tone, suffix], i) => (
          <div
            key={label}
            className={cn(
              "px-5 py-3.5",
              i % 2 === 1 && "border-l",
              i >= 2 && "border-t sm:border-t-0",
              i === 2 && "sm:border-l",
            )}
          >
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd
              className={cn("mt-0.5 text-lg font-semibold tabular-nums", tone)}
            >
              {value}
              {suffix && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {suffix}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
