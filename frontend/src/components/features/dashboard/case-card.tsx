import { ArrowRightIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";

import { PropertyImage } from "@/components/features/shared/property-image";
import { ScoreBadge } from "@/components/features/shared/score-badge";
import { StatusBadge } from "@/components/features/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { formatCompactCurrency, formatInteger, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TrainingCase } from "@/types/training";

const IMAGE_SIZES =
  "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw";

function CaseActions({ trainingCase: c }: { trainingCase: TrainingCase }) {
  if (c.status === "in_progress" && c.activeUnderwritingId !== null) {
    return (
      <Link
        href={ROUTES.underwriting(c.activeUnderwritingId)}
        className={cn(buttonVariants({ size: "lg" }), "flex-1")}
      >
        Resume draft
        <ArrowRightIcon data-icon="inline-end" />
      </Link>
    );
  }
  if (c.status === "submitted" && c.latestSubmissionId !== null) {
    return (
      <>
        <Link
          href={ROUTES.submission(c.latestSubmissionId)}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "flex-1 bg-card",
          )}
        >
          See result
        </Link>
        <Link
          href={ROUTES.property(c.zpid)}
          className={buttonVariants({ variant: "ghost", size: "lg" })}
        >
          <RotateCcwIcon data-icon="inline-start" />
          Try again
        </Link>
      </>
    );
  }
  return (
    <Link
      href={ROUTES.property(c.zpid)}
      className={cn(buttonVariants({ size: "lg" }), "flex-1")}
    >
      Start case
      <ArrowRightIcon data-icon="inline-end" />
    </Link>
  );
}

export function CaseCard({
  trainingCase: c,
  priority,
}: {
  trainingCase: TrainingCase;
  priority?: boolean;
}) {
  const location = [
    c.city && c.state ? `${c.city}, ${c.state}` : c.city,
    c.market?.name,
  ]
    .filter(Boolean)
    .join(" · ");
  const scores =
    c.attempts > 1 && c.latestScore && c.bestScore
      ? ` · Latest ${Math.round(c.latestScore.value)} · Best ${Math.round(c.bestScore.value)}`
      : "";
  const note =
    c.attempts > 0
      ? `${pluralize(c.attempts, "attempt")}${scores}${c.status === "in_progress" ? " · new draft open" : ""}`
      : c.status === "in_progress"
        ? "Draft saved. Pick up where you stopped."
        : null;

  return (
    <article
      className="flex flex-col overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
      data-testid="case-card"
      data-zpid={c.zpid}
      data-status={c.status}
    >
      <Link
        href={ROUTES.property(c.zpid)}
        className="relative block"
        tabIndex={-1}
        aria-hidden
      >
        <PropertyImage
          src={c.imageUrl}
          alt=""
          sizes={IMAGE_SIZES}
          priority={priority}
          className="aspect-video"
        />
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <StatusBadge status={c.status} />
          {c.latestScore && <ScoreBadge score={c.latestScore} />}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">
            <Link
              href={ROUTES.property(c.zpid)}
              className="hover:underline hover:underline-offset-4"
            >
              {c.street}
            </Link>
          </h3>
          {location && (
            <p
              className="truncate text-xs text-muted-foreground"
              title={location}
            >
              {location}
            </p>
          )}
        </div>

        <dl className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground/80 tabular-nums">
          <div>
            <dt className="sr-only">Price</dt>
            <dd>{formatCompactCurrency(c.price)}</dd>
          </div>
          {c.beds !== null && (
            <div>
              <dt className="sr-only">Bedrooms</dt>
              <dd>{c.beds} bd</dd>
            </div>
          )}
          {c.baths !== null && (
            <div>
              <dt className="sr-only">Bathrooms</dt>
              <dd>{c.baths} ba</dd>
            </div>
          )}
          {c.areaSqft !== null && (
            <div>
              <dt className="sr-only">Living area</dt>
              <dd>{formatInteger(c.areaSqft)} sq ft</dd>
            </div>
          )}
        </dl>

        {note && (
          <p className="text-xs text-muted-foreground" data-testid="case-note">
            {note}
          </p>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <CaseActions trainingCase={c} />
        </div>
      </div>
    </article>
  );
}
