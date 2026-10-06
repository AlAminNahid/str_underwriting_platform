import { PRR_SANITY_RANGE } from "@/constants/underwriting";
import type { UnderwritingCalculation } from "@/types/underwriting";

export function getSanityWarning(
  calculation: UnderwritingCalculation,
): string | null {
  const notes: string[] = [];
  const { prr } = calculation;

  if (prr !== null && prr < PRR_SANITY_RANGE.min)
    notes.push(
      `Your Mid forecast gives a PRR of ${prr.toFixed(1)}%, which is unusually low for a short-term rental.`,
    );
  if (prr !== null && prr > PRR_SANITY_RANGE.max)
    notes.push(
      `Your Mid forecast gives a PRR of ${prr.toFixed(1)}%, which is unusually high for a short-term rental.`,
    );

  const cashFlows = Object.values(calculation.scenarios)
    .map((s) => s?.freeCashFlow)
    .filter((v): v is number => v != null);
  if (cashFlows.length > 0 && cashFlows.every((v) => v < 0))
    notes.push(
      cashFlows.length > 1
        ? "Cash flow is negative in every scenario."
        : "Cash flow is negative.",
    );

  return notes.length > 0
    ? `${notes.join(" ")} Double-check your inputs before submitting.`
    : null;
}
