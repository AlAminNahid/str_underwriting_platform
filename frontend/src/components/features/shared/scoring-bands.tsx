import { ScoreBadge } from "@/components/features/shared/score-badge";
import { SCORE_BANDS } from "@/constants/scoring";
import type { Rating } from "@/types/training";

const ORDER: Rating[] = ["best", "medium", "low"];

export function ScoringBands() {
  return (
    <ul className="divide-y" data-testid="scoring-bands">
      {ORDER.map((rating) => (
        <li key={rating} className="flex items-center gap-3 py-2.5 text-sm">
          <ScoreBadge
            score={{ value: SCORE_BANDS[rating].score, rating }}
            className="w-[92px] justify-center shadow-none"
          />
          <span>{SCORE_BANDS[rating].description}</span>
        </li>
      ))}
    </ul>
  );
}
