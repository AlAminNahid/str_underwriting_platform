"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { rankAttempts } from "@/lib/leaderboard";
import { getAllAttempts, getSubmission } from "@/services/submission.service";

export function useSubmission(id: number) {
  return useQuery({
    queryKey: queryKeys.submission(id),
    queryFn: ({ signal }) => getSubmission(id, signal),
    enabled: Number.isInteger(id) && id > 0,
    staleTime: Infinity,
  });
}

export function useRankedAttempts() {
  return useQuery({
    queryKey: queryKeys.allSubmissions,
    queryFn: ({ signal }) => getAllAttempts(signal),
    select: rankAttempts,
  });
}
