import type { CaseStatus } from "@/types/training";

export const CASE_STATUS: Record<CaseStatus, { label: string; tone: string; dot: string }> = {
  not_started: { label: "Not started", tone: "bg-card text-foreground", dot: "bg-muted-foreground" },
  in_progress: { label: "In progress", tone: "bg-info-soft text-info", dot: "bg-info" },
  submitted: { label: "Submitted", tone: "bg-card text-foreground", dot: "bg-success" },
};

export const CASE_STATUS_FILTERS = ["all", "not_started", "in_progress", "submitted"] as const;
export type CaseStatusFilter = (typeof CASE_STATUS_FILTERS)[number];
