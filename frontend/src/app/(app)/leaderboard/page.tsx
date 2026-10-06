import type { Metadata } from "next";

import { LeaderboardView } from "@/components/features/leaderboard/leaderboard-view";
import { PageBreadcrumbs } from "@/components/layouts/breadcrumbs";
import { PageHeader } from "@/components/layouts/page-header";

export const metadata: Metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Leaderboard" }]} />
      <PageHeader
        title="Leaderboard"
        description="Your graded attempts across all properties, ranked by score and then by how close your Mid forecast was to the analyst's."
      />
      <LeaderboardView />
    </>
  );
}
