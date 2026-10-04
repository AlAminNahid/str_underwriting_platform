import { formatCurrency, formatPercent } from "@/lib/format";
import type { Attempt } from "@/types/training";

export interface ScoreExplanation {
  headline: string;
  body: string;
  tip: string;
}

export function explainScore(attempt: Attempt): ScoreExplanation {
  const {
    midForecast: mine,
    referenceMid: ref,
    deviation,
    bestThreshold,
    mediumThreshold,
  } = attempt;

  if (mine === null || ref === null) {
    return {
      headline: "No Mid forecast was graded",
      body: "This attempt had no Mid revenue forecast to compare, so it scored in the Low band.",
      tip: "Enter a Mid revenue forecast before you submit.",
    };
  }

  const direction = mine >= ref ? "above" : "below";
  const off = `${formatPercent(deviation)} ${direction}`;
  const base = `Your Mid forecast of ${formatCurrency(mine)} was ${off} the analyst's ${formatCurrency(ref)}.`;
  const tip =
    mine >= ref
      ? "You forecast higher than the analyst. Check whether the nightly rate or occupancy you assumed is too optimistic for this market."
      : "You forecast lower than the analyst. Check whether you gave enough credit to amenities such as a hot tub or game room.";

  if (attempt.score.rating === "best") {
    return {
      headline: "Within the Best band",
      body: `${base} Forecasts within ${formatPercent(bestThreshold, 0)} of the reference score 100.`,
      tip: "Strong read on this market. Try a property in a different market next to test your range.",
    };
  }

  if (attempt.score.rating === "medium") {
    const closer = Math.abs(mine - ref) - ref * bestThreshold;
    return {
      headline: "Close, but outside the Best band",
      body: `${base} Moving ${formatCurrency(Math.max(0, Math.ceil(closer)))} closer would have scored 100.`,
      tip,
    };
  }

  return {
    headline: "Outside the scoring range",
    body: `${base} A forecast between ${formatCurrency(ref * (1 - mediumThreshold))} and ${formatCurrency(ref * (1 + mediumThreshold))} scores at least 70.`,
    tip,
  };
}
