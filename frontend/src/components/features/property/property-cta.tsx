"use client";

import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { useStartUnderwriting } from "@/hooks/use-underwriting";
import { cn } from "@/lib/utils";
import type { TrainingCase } from "@/types/training";

export function PropertyCta({
  zpid,
  trainingCase,
  loading,
  fullWidth = false,
  testId = "property-cta",
}: {
  zpid: string;
  trainingCase: TrainingCase | null;
  loading: boolean;
  fullWidth?: boolean;
  testId?: string;
}) {
  const start = useStartUnderwriting();

  if (loading)
    return <Skeleton className={cn("h-9", fullWidth ? "w-full" : "w-44")} />;

  const resumeId =
    trainingCase?.status === "in_progress"
      ? trainingCase.activeUnderwritingId
      : null;

  if (resumeId !== null) {
    return (
      <Link
        href={ROUTES.underwriting(resumeId)}
        className={cn(buttonVariants({ size: "lg" }), fullWidth && "w-full")}
        data-testid={testId}
      >
        Resume draft
        <ArrowRightIcon data-icon="inline-end" />
      </Link>
    );
  }

  const label =
    trainingCase && trainingCase.attempts > 0
      ? "Start new attempt"
      : "Start underwriting";
  const busy = start.isPending || start.isSuccess;

  return (
    <Button
      size="lg"
      className={cn(fullWidth && "w-full")}
      onClick={() => start.mutate(zpid)}
      disabled={busy}
      data-testid={testId}
    >
      {busy ? (
        <>
          <Loader2Icon className="animate-spin" data-icon="inline-start" />
          Starting…
        </>
      ) : (
        <>
          {label}
          <ArrowRightIcon data-icon="inline-end" />
        </>
      )}
    </Button>
  );
}
