"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getDashboard } from "@/services/dashboard.service";
import type { Dashboard } from "@/types/training";

export function useDashboard<T = Dashboard>(select?: (data: Dashboard) => T) {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: ({ signal }) => getDashboard(signal),
    select,
  });
}

/**
 * One property's training status (status, active draft, other cases in its market),
 * read from the shared dashboard query so it's usually already cached.
 */
export function useTrainingCase(zpid: string) {
  return useDashboard((data) => {
    const current = data.cases.find((c) => c.zpid === zpid) ?? null;
    const sameMarket = current?.market
      ? data.cases.filter(
          (c) => c.zpid !== zpid && c.market?.id === current.market?.id,
        )
      : [];
    return { current, sameMarket };
  });
}
