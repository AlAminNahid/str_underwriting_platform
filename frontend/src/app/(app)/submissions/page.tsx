import type { Metadata } from "next";

import { ComingNext } from "@/components/features/shared/coming-next";

export const metadata: Metadata = { title: "Submissions" };

export default function SubmissionsPage() {
  return (
    <ComingNext title="Submissions" breadcrumbs={[{ label: "Submissions" }]} />
  );
}
