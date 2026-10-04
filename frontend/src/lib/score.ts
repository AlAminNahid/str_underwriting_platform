import { toNumber } from "@/lib/number";
import type { Rating, Score } from "@/types/training";

const RATINGS: readonly Rating[] = ["best", "medium", "low"];

export function isRating(value: unknown): value is Rating {
  return RATINGS.includes(value as Rating);
}

/** Builds a Score from the API's decimal-string accuracy and rating, or null if either is missing. */
export function toScore(
  accuracy: string | number | null,
  rating: string | null,
): Score | null {
  const value = toNumber(accuracy);
  if (value === null || !isRating(rating)) return null;
  return { value, rating };
}
