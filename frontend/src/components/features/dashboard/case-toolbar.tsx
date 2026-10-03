"use client";

import { MapPinIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CASE_STATUS,
  CASE_STATUS_FILTERS,
  type CaseStatusFilter,
} from "@/constants/case-status";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { CaseFilters } from "@/lib/dashboard";
import type { Market } from "@/types/training";

const ALL_MARKETS = "all";

export function CaseToolbar({
  filters,
  counts,
  markets,
  onChange,
}: {
  filters: CaseFilters;
  counts: Record<CaseStatusFilter, number>;
  markets: Market[];
  onChange: (patch: Partial<CaseFilters>) => void;
}) {
  const [query, setQuery] = useState(filters.query);
  const [syncedQuery, setSyncedQuery] = useState(filters.query);
  if (filters.query !== syncedQuery) {
    setSyncedQuery(filters.query);
    setQuery(filters.query);
  }

  const debouncedQuery = useDebouncedValue(query, 200);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    if (debouncedQuery.trim() !== filters.query.trim())
      onChangeRef.current({ query: debouncedQuery });
  }, [debouncedQuery]);

  const marketItems = [
    { value: ALL_MARKETS, label: "All markets" },
    ...markets.map((m) => ({ value: String(m.id), label: m.name })),
  ];
  const selectedMarket = marketItems.some(
    (item) => item.value === filters.market,
  )
    ? filters.market
    : ALL_MARKETS;

  return (
    <div className="flex flex-wrap items-center gap-3 border-y px-4 py-3">
      <ToggleGroup
        aria-label="Filter by status"
        value={[filters.status]}
        onValueChange={(value) =>
          value[0] && onChange({ status: value[0] as CaseStatusFilter })
        }
        spacing={0}
        className="flex-wrap rounded-lg bg-muted p-[3px]"
        data-testid="status-filter"
      >
        {CASE_STATUS_FILTERS.map((status) => (
          <ToggleGroupItem
            key={status}
            value={status}
            size="sm"
            className="gap-1.5 rounded-md! px-2.5 text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-sm"
          >
            {status === "all" ? "All" : CASE_STATUS[status].label}
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {counts[status]}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
        <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search address or city"
            aria-label="Search properties"
            className="h-9 bg-card pr-8 pl-8 shadow-xs [&::-webkit-search-cancel-button]:hidden"
            data-testid="case-search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <Select
          items={marketItems}
          value={selectedMarket}
          onValueChange={(value) =>
            onChange({ market: (value as string | null) ?? ALL_MARKETS })
          }
        >
          <SelectTrigger
            className="h-9! min-w-0 flex-1 bg-card shadow-xs sm:w-56 sm:flex-none"
            aria-label="Filter by market"
            data-testid="market-filter"
          >
            <MapPinIcon className="text-muted-foreground" aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            align="end"
            className="min-w-56"
          >
            {marketItems.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
