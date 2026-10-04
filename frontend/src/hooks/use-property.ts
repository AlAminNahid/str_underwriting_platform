"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getMarket } from "@/services/market.service";
import { getProperty } from "@/services/property.service";
import { getAttemptsForProperty } from "@/services/submission.service";

export function useProperty(zpid: string) {
  return useQuery({
    queryKey: queryKeys.property(zpid),
    queryFn: ({ signal }) => getProperty(zpid, signal),
  });
}

/** Waits until the property has told us its market. */
export function useMarket(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.market(id ?? -1),
    queryFn: ({ signal }) => getMarket(id!, signal),
    enabled: id !== undefined,
    staleTime: 5 * 60_000, // markets rarely change
  });
}

export function usePropertyAttempts(zpid: string) {
  return useQuery({
    queryKey: queryKeys.propertyAttempts(zpid),
    queryFn: ({ signal }) => getAttemptsForProperty(zpid, signal),
  });
}
