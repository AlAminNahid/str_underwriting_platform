"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  Loader2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { WORKSPACE_STEPS } from "@/constants/underwriting";
import type { SaveStatus } from "@/hooks/use-autosave";
import type { WorkspaceStep } from "@/types/underwriting";

function SaveIndicator({
  status,
  onRetry,
}: {
  status: SaveStatus;
  onRetry: () => void;
}) {
  if (status === "error") {
    return (
      <span
        className="flex items-center gap-2 text-sm text-danger"
        role="alert"
      >
        <CircleAlertIcon className="size-4" aria-hidden />
        Couldn&apos;t save
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </span>
    );
  }
  if (status === "saving" || status === "pending") {
    return (
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" aria-hidden />
        Saving…
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <CircleCheckIcon className="size-4 text-success" aria-hidden />
      All changes saved
    </span>
  );
}

const labelOf = (step: WorkspaceStep) =>
  WORKSPACE_STEPS.find((s) => s.id === step)?.label;

export function ActionBar({
  status,
  onRetry,
  previous,
  next,
  onNavigate,
  onSubmit,
  canSubmit = false,
}: {
  status: SaveStatus;
  onRetry: () => void;
  previous: WorkspaceStep | null;
  next: WorkspaceStep | null;
  onNavigate: (step: WorkspaceStep) => void;
  onSubmit?: () => void;
  canSubmit?: boolean;
}) {
  return (
    <div
      className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border bg-card/95 px-4 py-2.5 shadow-md backdrop-blur"
      data-testid="action-bar"
      aria-live="polite"
    >
      <SaveIndicator status={status} onRetry={onRetry} />
      <div className="ml-auto flex gap-2">
        {previous && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => onNavigate(previous)}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Back
          </Button>
        )}
        {next && (
          <Button size="lg" onClick={() => onNavigate(next)}>
            Continue to {labelOf(next)}
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        )}
        {!next && onSubmit && (
          <Button
            size="lg"
            onClick={onSubmit}
            disabled={!canSubmit}
            title={
              canSubmit ? undefined : "Resolve the items in the checklist first"
            }
            data-testid="submit-underwriting"
          >
            Submit for grading
          </Button>
        )}
      </div>
    </div>
  );
}
