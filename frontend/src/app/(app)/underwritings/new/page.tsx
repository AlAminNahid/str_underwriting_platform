import type { Metadata } from "next";

import { ComingNext } from "@/components/features/shared/coming-next";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = { title: "Start underwriting" };

/** Temporary target of "Start underwriting" until drafts are created in the workspace step. */
export default function NewUnderwritingPage() {
  return (
    <ComingNext
      title="Underwriting workspace"
      breadcrumbs={[
        { label: "Dashboard", href: ROUTES.dashboard },
        { label: "New underwriting" },
      ]}
    />
  );
}
