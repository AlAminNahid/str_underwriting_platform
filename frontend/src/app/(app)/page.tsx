import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardSkeleton } from "@/components/features/dashboard/dashboard-skeleton";
import { DashboardView } from "@/components/features/dashboard/dashboard-view";
import { PageBreadcrumbs } from "@/components/layouts/breadcrumbs";
import { PageHeader } from "@/components/layouts/page-header";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Dashboard" }]} />
      <PageHeader
        title="Training dashboard"
        description="Underwrite each property, then submit. Your Mid revenue forecast is graded against a senior analyst's reference."
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardView />
      </Suspense>
    </>
  );
}
