import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
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
  /** Stretch to the container, e.g. the button at the end of the page. */
  fullWidth?: boolean;
  testId?: string;
}) {
  if (loading)
    return <Skeleton className={cn("h-9", fullWidth ? "w-full" : "w-44")} />;

  const resumeId =
    trainingCase?.status === "in_progress"
      ? trainingCase.activeUnderwritingId
      : null;

  const { href, label } =
    resumeId !== null
      ? {
          href: ROUTES.underwriting(resumeId),
          label: "Resume draft",
        }
      : {
          href: ROUTES.newUnderwriting(zpid),
          label:
            trainingCase && trainingCase.attempts > 0
              ? "Start new attempt"
              : "Start underwriting",
        };

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ size: "lg" }), fullWidth && "w-full")}
      data-testid={testId}
    >
      {label}
      <ArrowRightIcon data-icon="inline-end" />
    </Link>
  );
}
