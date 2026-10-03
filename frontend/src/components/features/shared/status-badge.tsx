import { CASE_STATUS } from "@/constants/case-status";
import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/types/training";

export function StatusBadge({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) {
  const { label, tone, dot } = CASE_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium shadow-sm ring-1 ring-black/5",
        tone,
        className,
      )}
      data-testid="status-badge"
    >
      <span className={cn("size-1.5 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}
