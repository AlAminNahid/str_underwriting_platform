"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  CASE_STATUS_FILTERS,
  type CaseStatusFilter,
} from "@/constants/case-status";
import type { CaseFilters } from "@/lib/dashboard";

const DEFAULTS: CaseFilters = { status: "all", market: "all", query: "" };

function parseStatus(value: string | null): CaseStatusFilter {
  return CASE_STATUS_FILTERS.includes(value as CaseStatusFilter)
    ? (value as CaseStatusFilter)
    : DEFAULTS.status;
}

export function useCaseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<CaseFilters>(
    () => ({
      status: parseStatus(searchParams.get("status")),
      market: searchParams.get("market") ?? DEFAULTS.market,
      query: searchParams.get("q") ?? DEFAULTS.query,
    }),
    [searchParams],
  );

  const setFilters = useCallback(
    (patch: Partial<CaseFilters>) => {
      const next = { ...filters, ...patch };
      const params = new URLSearchParams();
      if (next.status !== DEFAULTS.status) params.set("status", next.status);
      if (next.market !== DEFAULTS.market) params.set("market", next.market);
      if (next.query.trim()) params.set("q", next.query.trim());
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, setFilters };
}
