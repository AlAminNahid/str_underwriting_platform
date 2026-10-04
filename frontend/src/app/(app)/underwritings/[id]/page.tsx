import type { Metadata } from "next";
import { Suspense } from "react";

import { WorkspaceSkeleton } from "@/components/features/underwriting/workspace-skeleton";
import { WorkspaceView } from "@/components/features/underwriting/workspace-view";

export const metadata: Metadata = { title: "Underwriting" };

export default async function UnderwritingPage({
  params,
}: PageProps<"/underwritings/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspaceView id={Number(id)} />
    </Suspense>
  );
}
