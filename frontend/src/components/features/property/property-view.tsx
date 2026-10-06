"use client";

import { ExternalLinkIcon, MapPinIcon, MapPinOffIcon } from "lucide-react";
import Link from "next/link";

import { PropertyImage } from "@/components/features/shared/property-image";
import { ScoringBands } from "@/components/features/shared/scoring-bands";
import { StatusBadge } from "@/components/features/shared/status-badge";
import { LoadError } from "@/components/features/shared/load-error";
import { PageBreadcrumbs } from "@/components/layouts/breadcrumbs";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";
import { useTrainingCase } from "@/hooks/use-dashboard";
import {
  useMarket,
  useProperty,
  usePropertyAttempts,
} from "@/hooks/use-property";
import { ApiError } from "@/services/api-client";

import { AttemptHistoryCard } from "./attempt-history-card";
import { FrameworkCard } from "./framework-card";
import { MarketCard } from "./market-card";
import { PropertyCta } from "./property-cta";
import { PropertyDetailsCard } from "./property-details-card";
import { PropertySkeleton } from "./property-skeleton";

const HERO_SIZES = "(min-width: 1024px) 900px, 100vw";

export function PropertyView({ zpid }: { zpid: string }) {
  const property = useProperty(zpid);
  const training = useTrainingCase(zpid);
  const attempts = usePropertyAttempts(zpid);
  const market = useMarket(property.data?.market?.id);

  const crumbs = [
    { label: "Dashboard", href: ROUTES.dashboard },
    { label: property.data?.street ?? "Property" },
  ];

  if (property.isPending) {
    return (
      <>
        <PageBreadcrumbs items={crumbs} />
        <PropertySkeleton />
      </>
    );
  }

  if (property.error) {
    const notFound =
      property.error instanceof ApiError && property.error.status === 404;
    return (
      <>
        <PageBreadcrumbs items={crumbs} />
        <Card
          className="py-0"
          data-testid={notFound ? "property-not-found" : "property-error"}
        >
          {notFound ? (
            <EmptyState
              icon={MapPinOffIcon}
              title="We couldn't find this property"
              description="It may have been removed from the training programme."
              action={
                <Link
                  href={ROUTES.dashboard}
                  className={buttonVariants({ size: "lg" })}
                >
                  Back to dashboard
                </Link>
              }
            />
          ) : (
            <LoadError
              title="We couldn't load this property"
              error={property.error}
              onRetry={() => property.refetch()}
              isRetrying={property.isRefetching}
            />
          )}
        </Card>
      </>
    );
  }

  const p = property.data;
  const trainingCase = training.data?.current ?? null;
  const location = [p.city, [p.state, p.zipcode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <PageBreadcrumbs items={crumbs} />
      <PageHeader
        title={p.street}
        badge={trainingCase && <StatusBadge status={trainingCase.status} />}
        meta={
          <>
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3.5" aria-hidden />
                {location}
              </span>
            )}
            {p.market && (
              <>
                <span
                  className="size-1 rounded-full bg-muted-foreground/60"
                  aria-hidden
                />
                <span>{p.market.name}</span>
              </>
            )}
          </>
        }
        actions={
          <>
            {p.listingUrl && (
              <a
                href={p.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                <ExternalLinkIcon data-icon="inline-start" />
                View listing
              </a>
            )}
            <PropertyCta
              zpid={zpid}
              trainingCase={trainingCase}
              loading={training.isPending}
            />
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <PropertyImage
            src={p.imageUrl}
            alt={`Listing photo of ${p.street}`}
            sizes={HERO_SIZES}
            priority
            className="aspect-[21/8] rounded-xl ring-1 ring-foreground/10"
          />
          <PropertyDetailsCard property={p} />
          {p.market && (
            <MarketCard
              market={market.data}
              loading={market.isPending}
              failed={market.isError}
              onRetry={() => market.refetch()}
              sameMarket={training.data?.sameMarket ?? []}
            />
          )}
          <FrameworkCard
            action={
              <PropertyCta
                zpid={zpid}
                trainingCase={trainingCase}
                loading={training.isPending}
                fullWidth
                testId="property-cta-bottom"
              />
            }
          />
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scoring</CardTitle>
              <CardDescription>
                Only your Mid revenue forecast is graded. The analyst&apos;s
                number stays hidden until you submit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScoringBands />
            </CardContent>
          </Card>
          <AttemptHistoryCard
            attempts={attempts.data}
            loading={attempts.isPending}
            failed={attempts.isError}
            onRetry={() => attempts.refetch()}
          />
        </div>
      </div>
    </>
  );
}
