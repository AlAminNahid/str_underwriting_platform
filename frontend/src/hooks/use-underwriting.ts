"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { clearDraftBackup } from "@/lib/underwriting/draft-storage";
import { mapUnderwriting } from "@/lib/underwriting/form-mapper";
import { ApiError } from "@/services/api-client";
import { mapDashboard } from "@/services/dashboard.service";
import { mapAttempt } from "@/services/submission.service";
import {
  getUnderwriting,
  startUnderwriting,
  submitUnderwriting,
} from "@/services/underwriting.service";
import type { SaveUnderwritingPayloadDto } from "@/types/api";

export function useUnderwriting(id: number) {
  return useQuery({
    queryKey: queryKeys.underwriting(id),
    queryFn: ({ signal }) => getUnderwriting(id, signal),
    select: mapUnderwriting,
    enabled: Number.isInteger(id) && id > 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useStartUnderwriting() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: startUnderwriting,
    onSuccess: (draft) => {
      queryClient.setQueryData(queryKeys.underwriting(draft.id), draft);
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      router.push(ROUTES.underwriting(draft.id));
    },
    onError: (error) => {
      toast.error("Couldn't start the underwriting", {
        description:
          error instanceof ApiError
            ? error.message
            : "Something went wrong. Try again.",
      });
    },
  });
}

export function useSubmitUnderwriting() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: SaveUnderwritingPayloadDto;
    }) => submitUnderwriting(id, payload),
    onSuccess: (result, { id }) => {
      clearDraftBackup(id);
      queryClient.setQueryData(
        queryKeys.dashboard,
        mapDashboard(result.dashboard),
      );
      const attempt = mapAttempt(result.submission);
      if (attempt)
        queryClient.setQueryData(queryKeys.submission(attempt.id), attempt);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.allSubmissions,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.underwriting(id),
        refetchType: "none",
      });
      router.replace(ROUTES.submission(result.submission.id));
    },
  });
}
