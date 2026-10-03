import {
  CircleCheckIcon,
  LayersIcon,
  TargetIcon,
  TrophyIcon,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { DashboardStats as Stats } from "@/lib/dashboard";

import { StatCard } from "./stat-card";

export function DashboardStats({ stats }: { stats: Stats }) {
  const { total, completed, averageScore, perfect, inProgress, notStarted } =
    stats;

  return (
    <section
      aria-label="Your progress"
      className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      <StatCard
        testId="stat-completed"
        label="Completed cases"
        icon={CircleCheckIcon}
        value={completed}
        suffix={`/ ${total}`}
        footer={
          <Progress
            value={total ? (completed / total) * 100 : 0}
            aria-label={`${completed} of ${total} cases completed`}
            className="mt-1"
          />
        }
      />
      <StatCard
        testId="stat-average"
        label="Average score"
        icon={TargetIcon}
        value={averageScore === null ? "—" : Math.round(averageScore)}
        footer="Latest attempt per property"
      />
      <StatCard
        testId="stat-perfect"
        label="Perfect scores"
        icon={TrophyIcon}
        value={completed ? perfect : "—"}
        suffix={completed ? `/ ${completed}` : undefined}
        footer="Completed cases scored 100"
      />
      <StatCard
        testId="stat-in-progress"
        label="In progress"
        icon={LayersIcon}
        value={inProgress}
        footer={`${notStarted} not started`}
      />
    </section>
  );
}
