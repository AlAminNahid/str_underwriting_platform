import { RATING_TONE, SCORE_BANDS } from "@/constants/scoring";
import { cn } from "@/lib/utils";
import type { Score } from "@/types/training";

export function ScoreBadge({
  score,
  className,
}: {
  score: Score;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold tabular-nums shadow-sm",
        RATING_TONE[score.rating],
        className,
      )}
      data-testid="score-badge"
      data-rating={score.rating}
    >
      {Math.round(score.value)} · {SCORE_BANDS[score.rating].label}
    </span>
  );
}
