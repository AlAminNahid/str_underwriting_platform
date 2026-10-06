import type { Metadata } from "next";
import { Suspense } from "react";

import {
  SubmissionsSkeleton,
  SubmissionsView,
} from "@/components/features/submissions/submissions-view";
import { PageBreadcrumbs } from "@/components/layouts/breadcrumbs";
import { PageHeader } from "@/components/layouts/page-header";

export const metadata: Metadata = { title: "Submissions" };

export default function SubmissionsPage() {
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Submissions" }]} />
      <PageHeader
        title="Submissions"
        description="Every graded attempt, newest first. Open one to see how your forecast was scored."
      />
      <Suspense fallback={<SubmissionsSkeleton />}>
        <SubmissionsView />
      </Suspense>
    </>
  );
}
