import type { Metadata } from "next";

import { ComingNext } from "@/components/features/shared/coming-next";

export const metadata: Metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return (
    <ComingNext title="Leaderboard" breadcrumbs={[{ label: "Leaderboard" }]} />
  );
}
