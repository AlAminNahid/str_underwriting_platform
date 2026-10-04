import type { CaseStatusFilter } from "@/constants/case-status";
import type { Dashboard, Market, TrainingCase } from "@/types/training";

export interface DashboardStats {
  total: number;
  completed: number;
  averageScore: number | null;
  inProgress: number;
  notStarted: number;
}

export function computeStats({ summary, cases }: Dashboard): DashboardStats {
  return {
    total: cases.length,
    // Properties with a graded attempt (latest score), same basis as the average.
    completed: cases.filter((c) => c.latestScore !== null).length,
    averageScore: summary.averageScore,
    inProgress: summary.inProgress,
    notStarted: summary.notStarted,
  };
}

export function countByStatus(
  cases: TrainingCase[],
): Record<CaseStatusFilter, number> {
  return {
    all: cases.length,
    not_started: cases.filter((c) => c.status === "not_started").length,
    in_progress: cases.filter((c) => c.status === "in_progress").length,
    submitted: cases.filter((c) => c.status === "submitted").length,
  };
}

export function getMarkets(cases: TrainingCase[]): Market[] {
  const byId = new Map<number, Market>();
  for (const c of cases) if (c.market) byId.set(c.market.id, c.market);
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export interface CaseFilters {
  status: CaseStatusFilter;
  market: string;
  query: string;
}

export function filterCases(
  cases: TrainingCase[],
  { status, market, query }: CaseFilters,
) {
  const q = query.trim().toLowerCase();
  return cases.filter((c) => {
    if (status !== "all" && c.status !== status) return false;
    if (market !== "all" && String(c.market?.id) !== market) return false;
    if (!q) return true;
    return [c.street, c.city, c.state, c.zipcode, c.market?.name]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q));
  });
}
