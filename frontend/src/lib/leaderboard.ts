import type { Attempt } from "@/types/training";

export function rankAttempts(attempts: Attempt[]): Attempt[] {
  return [...attempts].sort(
    (a, b) =>
      b.score.value - a.score.value ||
      a.deviation - b.deviation ||
      a.submittedAt.getTime() - b.submittedAt.getTime(),
  );
}

export function rankOf(ranked: Attempt[], id: number): number | null {
  const index = ranked.findIndex((a) => a.id === id);
  return index === -1 ? null : index + 1;
}
