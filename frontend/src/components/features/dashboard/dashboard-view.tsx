"use client";

import { useMemo } from "react";

import { LoadError } from "@/components/features/shared/load-error";
import { Card } from "@/components/ui/card";
import { useCaseFilters } from "@/hooks/use-case-filters";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  computeStats,
  countByStatus,
  filterCases,
  getMarkets,
} from "@/lib/dashboard";
import { pluralize } from "@/lib/format";

import { CaseEmptyState } from "./case-empty-state";
import { CaseGrid } from "./case-grid";
import { CaseToolbar } from "./case-toolbar";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { DashboardStats } from "./dashboard-stats";

export function DashboardView() {
  const { data, error, isPending, refetch, isRefetching } = useDashboard();
  const { filters, setFilters } = useCaseFilters();

  const derived = useMemo(() => {
    if (!data) return null;
    return {
      stats: computeStats(data),
      counts: countByStatus(data.cases),
      markets: getMarkets(data.cases),
      visible: filterCases(data.cases, filters),
    };
  }, [data, filters]);

  if (isPending) return <DashboardSkeleton />;

  if (error || !derived) {
    return (
      <Card className="py-0" data-testid="dashboard-error">
        <LoadError
          title="We couldn't load your training cases"
          error={error}
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      </Card>
    );
  }

  const { stats, counts, markets, visible } = derived;
  const marketCount = markets.length;

  return (
    <>
      <DashboardStats stats={stats} />

      <Card className="gap-0 py-0" aria-labelledby="training-cases-heading">
        <div className="px-5 py-4">
          <h2 id="training-cases-heading" className="font-semibold">
            Training cases
          </h2>
          <p className="text-sm text-muted-foreground">
            {pluralize(stats.total, "property", "properties")} across{" "}
            {pluralize(marketCount, "market")}
          </p>
        </div>

        <CaseToolbar
          filters={filters}
          counts={counts}
          markets={markets}
          onChange={setFilters}
        />

        <div className="p-4">
          {visible.length > 0 ? (
            <CaseGrid cases={visible} />
          ) : (
            <CaseEmptyState filters={filters} onChange={setFilters} />
          )}
        </div>
      </Card>
    </>
  );
}
