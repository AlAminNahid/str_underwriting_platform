import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STEPS = [
  {
    step: "Cost up front",
    title: "Total Out of Pocket",
    detail: "Down payment + closing costs + setup spend",
  },
  {
    step: "Earnings each year",
    title: "Annual Free Cash Flow",
    detail: "Revenue − operating costs − mortgage",
  },
  {
    step: "Quality of return",
    title: "Cash-on-Cash",
    detail: "Cash flow ÷ Total Out of Pocket",
  },
] as const;

/** `action` renders as the card footer: "here's what you'll calculate → start". */
export function FrameworkCard({ action }: { action?: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What you&apos;ll work out</CardTitle>
        <CardDescription>
          Every input in the workspace feeds one of these three results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid overflow-hidden rounded-lg border sm:grid-cols-3">
          {STEPS.map(({ step, title, detail }, index) => (
            <li
              key={title}
              className="space-y-1 bg-muted/50 px-4 py-3.5 not-first:border-t sm:not-first:border-t-0 sm:not-first:border-l"
            >
              <p className="text-xs font-medium text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")} · {step}
              </p>
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </li>
          ))}
        </ol>
      </CardContent>
      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  );
}
