import {
  ClipboardCheckIcon,
  FilePenLineIcon,
  PartyPopperIcon,
  SearchXIcon,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { CaseFilters } from "@/lib/dashboard";

interface EmptyCopy {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; next: Partial<CaseFilters> };
}

function copyFor({ status, market, query }: CaseFilters): EmptyCopy {
  if (query.trim() || market !== "all") {
    return {
      icon: SearchXIcon,
      title: query.trim()
        ? `No properties match “${query.trim()}”`
        : "No properties in this market",
      description:
        "Try another address, city or market, or clear the filters to see every case.",
      action: {
        label: "Clear filters",
        next: { status: "all", market: "all", query: "" },
      },
    };
  }

  switch (status) {
    case "in_progress":
      return {
        icon: FilePenLineIcon,
        title: "No cases in progress",
        description:
          "When you start underwriting a property, your draft is saved here so you can pick up where you left off.",
        action: {
          label: "Choose a case to start",
          next: { status: "not_started" },
        },
      };
    case "submitted":
      return {
        icon: ClipboardCheckIcon,
        title: "Nothing submitted yet",
        description:
          "Finish and submit your first underwriting to see your score here.",
        action: {
          label: "Choose a case to start",
          next: { status: "not_started" },
        },
      };
    case "not_started":
      return {
        icon: PartyPopperIcon,
        title: "You've started every case",
        description:
          "Nice work. Finish your drafts in progress, or try a submitted case again to improve your score.",
        action: { label: "View all cases", next: { status: "all" } },
      };
    default:
      return {
        icon: SearchXIcon,
        title: "No training cases yet",
        description: "Training properties will appear here once they're added.",
      };
  }
}

export function CaseEmptyState({
  filters,
  onChange,
}: {
  filters: CaseFilters;
  onChange: (patch: Partial<CaseFilters>) => void;
}) {
  const { icon, title, description, action } = copyFor(filters);

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        action && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => onChange(action.next)}
          >
            {action.label}
          </Button>
        )
      }
      data-testid="cases-empty"
    />
  );
}
