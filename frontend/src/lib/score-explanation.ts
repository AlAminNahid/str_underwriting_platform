import { formatCurrency, formatPercent } from "@/lib/format";
import type { Attempt, MarketDetails } from "@/types/training";

export interface ScoreExplanation {
  headline: string;
  body: string;
  tip: string;
  marketContext: { name: string; description: string } | null;
}

export function explainScore(
  attempt: Attempt,
  market: MarketDetails | null = null,
): ScoreExplanation {
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
      marketContext: null,
    };
  }

  const direction = mine >= ref ? "above" : "below";
  const off = `${formatPercent(deviation)} ${direction}`;
  const base = `Your Mid forecast of ${formatCurrency(mine)} was ${off} the analyst's ${formatCurrency(ref)}.`;

  if (attempt.score.rating === "best") {
    return {
      headline: "Within the Best band",
      body: `${base} Forecasts within ${formatPercent(bestThreshold, 0)} of the reference score 100.`,
      tip: "Strong read on this market. Try a property in a different market next to test your range.",
      marketContext: null,
    };
  }

  const marketContext = market?.description
    ? { name: market.name, description: market.description }
    : null;
  const over = mine >= ref;

  if (attempt.score.rating === "medium") {
    const tip = over
      ? marketContext
        ? `You forecast higher than the analyst. Double-check your nightly rate or occupancy — they may be a touch optimistic for ${marketContext.name}.`
        : "You forecast higher than the analyst. Double-check your nightly rate or occupancy — they may be a touch optimistic for this market."
      : marketContext
        ? `You forecast lower than the analyst. Make sure you're giving full credit for amenities like a hot tub or game room — they tend to push revenue higher in ${marketContext.name}.`
        : "You forecast lower than the analyst. Make sure you're giving full credit for amenities like a hot tub or game room — they tend to push revenue higher than expected.";
    const closer = Math.abs(mine - ref) - ref * bestThreshold;
    return {
      headline: "Close, but outside the Best band",
      body: `${base} Moving ${formatCurrency(Math.max(0, Math.ceil(closer)))} closer would have scored 100.`,
      tip,
      marketContext,
    };
  }

  const tip = over
    ? marketContext
      ? `Your forecast is well above the analyst's reference. Revisit your comparable listings — you may be assuming stronger demand (rate, occupancy, or seasonality) than ${marketContext.name} actually supports.`
      : "Your forecast is well above the analyst's reference. Revisit your comparable listings — you may be assuming stronger demand (rate, occupancy, or seasonality) than this property actually supports."
    : marketContext
      ? `Your forecast is well below the analyst's reference. Revisit your comparable listings — you may be undercounting amenities, size, or seasonal demand that ${marketContext.name} actually supports.`
      : "Your forecast is well below the analyst's reference. Revisit your comparable listings — you may be undercounting amenities, size, or seasonal demand this property actually supports.";

  return {
    headline: "Outside the scoring range",
    body: `${base} A forecast between ${formatCurrency(ref * (1 - mediumThreshold))} and ${formatCurrency(ref * (1 + mediumThreshold))} scores at least 70.`,
    tip,
    marketContext,
  };
}
