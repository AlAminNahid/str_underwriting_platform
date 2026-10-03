import type { Rating } from "@/types/training";

/** Mirrors backend/app/services/scoring_service.py. */
export const SCORE_BANDS: Record<Rating, { label: string; score: number; description: string }> = {
  best: { label: "Best", score: 100, description: "Within 10% of the analyst" },
  medium: { label: "Medium", score: 70, description: "Within 25% of the analyst" },
  low: { label: "Low", score: 40, description: "More than 25% off, or missing" },
};

/** Solid pill colours per band: green / amber / red. */
export const RATING_TONE: Record<Rating, string> = {
  best: "bg-success text-white",
  medium: "bg-warning text-white",
  low: "bg-danger text-white",
};
