"use client";

import { CircleCheckIcon } from "lucide-react";

import { WORKSPACE_STEPS } from "@/constants/underwriting";
import { cn } from "@/lib/utils";
import type { WorkspaceStep } from "@/types/underwriting";

import { useWorkspace } from "./workspace-context";

export function StepTabs({
  current,
  onSelect,
}: {
  current: WorkspaceStep;
  onSelect: (step: WorkspaceStep) => void;
}) {
  const { issues } = useWorkspace();

  return (
    <div
      role="tablist"
      aria-label="Underwriting steps"
      className="mb-6 flex gap-1 overflow-x-auto border-b"
    >
      {WORKSPACE_STEPS.map(({ id, label }, index) => {
        const selected = id === current;
        const open =
          id === "tags"
            ? []
            : id === "review"
              ? issues
              : issues.filter((i) => i.step === id);
        const invalid = open.some((i) => i.kind === "invalid");

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(id)}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              selected
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            data-testid={`step-${id}`}
          >
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full text-[11px] font-semibold",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {index + 1}
            </span>
            {label}
            {id !== "tags" &&
              (open.length === 0 ? (
                <CircleCheckIcon
                  className="size-4 text-success"
                  aria-label="Complete"
                />
              ) : (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] leading-[18px] tabular-nums",
                    invalid
                      ? "bg-danger-soft text-danger"
                      : "bg-warning-soft text-warning",
                  )}
                  aria-label={`${open.length} open`}
                >
                  {open.length}
                </span>
              ))}
          </button>
        );
      })}
    </div>
  );
}
