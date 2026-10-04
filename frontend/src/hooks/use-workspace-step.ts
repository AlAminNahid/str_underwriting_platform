"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { WORKSPACE_STEPS } from "@/constants/underwriting";
import type { WorkspaceStep } from "@/types/underwriting";

const STEP_IDS = WORKSPACE_STEPS.map((s) => s.id);

export function useWorkspaceStep() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const param = searchParams.get("step") as WorkspaceStep | null;
  const step: WorkspaceStep =
    param && STEP_IDS.includes(param) ? param : "financials";
  const index = STEP_IDS.indexOf(step);

  const goTo = useCallback(
    (next: WorkspaceStep) => {
      const params = new URLSearchParams(searchParams);
      if (next === "financials") params.delete("step");
      else params.set("step", next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      window.scrollTo({ top: 0 });
    },
    [pathname, router, searchParams],
  );

  return {
    step,
    index,
    goTo,
    previous: index > 0 ? STEP_IDS[index - 1] : null,
    next: index < STEP_IDS.length - 1 ? STEP_IDS[index + 1] : null,
  };
}
