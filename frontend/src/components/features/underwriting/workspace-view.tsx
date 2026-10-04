"use client";

import {
  CircleCheckBigIcon,
  CloudOffIcon,
  FileQuestionIcon,
  LockIcon,
  MapPinIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { PageBreadcrumbs } from "@/components/layouts/breadcrumbs";
import { PageHeader } from "@/components/layouts/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";
import { useMarket } from "@/hooks/use-property";
import { useUnderwriting } from "@/hooks/use-underwriting";
import { formatCurrency } from "@/lib/format";
import { ApiError } from "@/services/api-client";

import { WorkspaceForm } from "./workspace-form";
import { WorkspaceSkeleton } from "./workspace-skeleton";

function Blocked({ children }: { children: ReactNode }) {
  return <Card className="py-0">{children}</Card>;
}

const backToDashboard = (
  <Link href={ROUTES.dashboard} className={buttonVariants({ size: "lg" })}>
    Back to dashboard
  </Link>
);

export function WorkspaceView({ id }: { id: number }) {
  const query = useUnderwriting(id);
  const draft = query.data;
  const market = useMarket(draft?.marketId ?? undefined);

  const crumbs = [
    { label: "Dashboard", href: ROUTES.dashboard },
    ...(draft?.zpid
      ? [{ label: draft.street, href: ROUTES.property(draft.zpid) }]
      : []),
    { label: "Underwriting" },
  ];

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    (query.error instanceof ApiError && query.error.status === 404)
  ) {
    return (
      <>
        <PageBreadcrumbs items={crumbs} />
        <Blocked>
          <EmptyState
            icon={FileQuestionIcon}
            title="We couldn't find this underwriting"
            description="The link may be wrong, or the draft no longer exists."
            action={backToDashboard}
            data-testid="workspace-not-found"
          />
        </Blocked>
      </>
    );
  }

  if (query.isPending) {
    return (
      <>
        <PageBreadcrumbs items={crumbs} />
        <WorkspaceSkeleton />
      </>
    );
  }

  if (query.error || !draft) {
    return (
      <>
        <PageBreadcrumbs items={crumbs} />
        <Blocked>
          <EmptyState
            icon={CloudOffIcon}
            title="We couldn't load this underwriting"
            description={
              query.error instanceof ApiError
                ? query.error.message
                : "Something went wrong. Try again in a moment."
            }
            action={
              <Button
                size="lg"
                onClick={() => query.refetch()}
                disabled={query.isRefetching}
              >
                {query.isRefetching ? "Retrying…" : "Try again"}
              </Button>
            }
            data-testid="workspace-error"
          />
        </Blocked>
      </>
    );
  }

  if (draft.isReference) {
    return (
      <>
        <PageBreadcrumbs items={crumbs} />
        <Blocked>
          <EmptyState
            icon={LockIcon}
            title="This underwriting isn't available"
            description="It isn't one of your training drafts."
            action={backToDashboard}
            data-testid="workspace-reference"
          />
        </Blocked>
      </>
    );
  }

  if (draft.isSubmitted) {
    return (
      <>
        <PageBreadcrumbs items={crumbs} />
        <Blocked>
          <EmptyState
            icon={CircleCheckBigIcon}
            title="This underwriting has been submitted"
            description="Submitted drafts can't be edited. Start a new attempt from the property page to try again."
            action={
              draft.zpid ? (
                <Link
                  href={ROUTES.property(draft.zpid)}
                  className={buttonVariants({ size: "lg" })}
                >
                  Go to property
                </Link>
              ) : (
                backToDashboard
              )
            }
            data-testid="workspace-submitted"
          />
        </Blocked>
      </>
    );
  }

  const location = [draft.city, draft.state].filter(Boolean).join(", ");

  return (
    <>
      <PageBreadcrumbs items={crumbs} />
      <PageHeader
        title={`Underwrite ${draft.street}`}
        badge={
          <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-info-soft px-2 text-xs font-medium text-info">
            <span className="size-1.5 rounded-full bg-info" aria-hidden />
            Draft
          </span>
        }
        meta={
          <>
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3.5" aria-hidden />
                {location}
              </span>
            )}
            {market.data && (
              <>
                <span
                  className="size-1 rounded-full bg-muted-foreground/60"
                  aria-hidden
                />
                <span>{market.data.name}</span>
              </>
            )}
            {draft.listPrice !== null && (
              <>
                <span
                  className="size-1 rounded-full bg-muted-foreground/60"
                  aria-hidden
                />
                <span className="tabular-nums">
                  List {formatCurrency(draft.listPrice)}
                </span>
              </>
            )}
          </>
        }
      />
      <WorkspaceForm key={draft.id} draft={draft} />
    </>
  );
}
