"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { newestFirst, rankAttempts } from "@/lib/leaderboard";
import { getAllAttempts, getSubmission } from "@/services/submission.service";

export function useSubmission(id: number) {
  return useQuery({
    queryKey: queryKeys.submission(id),
    queryFn: ({ signal }) => getSubmission(id, signal),
    enabled: Number.isInteger(id) && id > 0,
    staleTime: Infinity,
  });
}

export function useAllAttempts() {
  return useQuery({
    queryKey: queryKeys.allSubmissions,
    queryFn: ({ signal }) => getAllAttempts(signal),
    select: newestFirst,
  });
}

export function useRankedAttempts() {
  return useQuery({
    queryKey: queryKeys.allSubmissions,
    queryFn: ({ signal }) => getAllAttempts(signal),
    select: rankAttempts,
  });
}
