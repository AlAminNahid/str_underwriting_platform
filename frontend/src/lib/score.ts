import { formatPercent } from "@/lib/format";
import { toNumber } from "@/lib/number";
import type { Attempt, Rating, Score } from "@/types/training";

const RATINGS: readonly Rating[] = ["best", "medium", "low"];

export function isRating(value: unknown): value is Rating {
  return RATINGS.includes(value as Rating);
}

export function toScore(
  accuracy: string | number | null,
  rating: string | null,
): Score | null {
  const value = toNumber(accuracy);
  if (value === null || !isRating(rating)) return null;
  return { value, rating };
}

export function formatSignedDeviation({
  midForecast,
  referenceMid,
  deviation,
}: Attempt): string {
  if (midForecast === null) return "—";
  const sign = referenceMid !== null && midForecast < referenceMid ? "−" : "+";
  return `${sign}${formatPercent(deviation)}`;
}
