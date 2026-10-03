import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  icon: Icon,
  value,
  suffix,
  footer,
  testId,
}: {
  label: string;
  icon: LucideIcon;
  value: ReactNode;
  suffix?: ReactNode;
  footer?: ReactNode;
  testId: string;
}) {
  return (
    <Card className="gap-2 px-5 py-4" data-testid={testId}>
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{label}</span>
        <Icon className="size-4 opacity-70" aria-hidden />
      </div>
      <p className="text-[1.65rem] leading-tight font-semibold tracking-tight tabular-nums">
        <span data-testid={`${testId}-value`}>{value}</span>
        {suffix && (
          <span className="text-base font-medium text-muted-foreground">
            {" "}
            {suffix}
          </span>
        )}
      </p>
      {footer && <div className="text-xs text-muted-foreground">{footer}</div>}
    </Card>
  );
}
