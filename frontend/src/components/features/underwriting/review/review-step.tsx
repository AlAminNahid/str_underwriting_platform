"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  ServerIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEAL_TAGS } from "@/constants/underwriting";
import type { SaveStatus } from "@/hooks/use-autosave";
import { formatCurrency, formatCompactCurrency, pluralize } from "@/lib/format";
import { parseInput } from "@/lib/underwriting/calculations";
import { cn } from "@/lib/utils";
import type {
  FormIssue,
  SectionId,
  UnderwritingDraft,
  UnderwritingFormValues,
} from "@/types/underwriting";

import { useWorkspace } from "../workspace-context";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "purchase", label: "Purchase & financing" },
  { id: "optimization", label: "Optimization list" },
  { id: "opex", label: "Operating expenses" },
  { id: "taxes", label: "Taxes" },
  { id: "revenue", label: "Revenue forecasts" },
  { id: "assumptions", label: "Assumptions" },
];

const pct = (v: number | null) => (v === null ? "—" : `${v.toFixed(1)}%`);

function Checklist({ onGoTo }: { onGoTo: (issue: FormIssue) => void }) {
  const { issues } = useWorkspace();
  const missing = issues.filter((i) => i.kind === "missing").length;
  const invalid = issues.length - missing;

  return (
    <Card data-testid="review-checklist">
      <CardHeader>
        <CardTitle>Submission checklist</CardTitle>
        <CardDescription>
          Everything required must be complete and valid before you can submit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {issues.length ? (
          <div className="flex gap-3 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm">
            <TriangleAlertIcon
              className="mt-0.5 size-4 shrink-0 text-warning"
              aria-hidden
            />
            <p>
              <b className="block font-semibold">
                {pluralize(issues.length, "item")} need
                {issues.length === 1 ? "s" : ""} attention
              </b>
              {missing} missing, {invalid} invalid. Use Go to field to fix each
              one.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 rounded-lg border border-success/30 bg-success-soft px-4 py-3 text-sm">
            <CircleCheckIcon
              className="mt-0.5 size-4 shrink-0 text-success"
              aria-hidden
            />
            <p>
              <b className="block font-semibold">Ready to submit</b>
              All required inputs are complete and valid. Deal tags are
              optional.
            </p>
          </div>
        )}

        {SECTIONS.map((section) => {
          const open = issues.filter((i) => i.section === section.id);
          return (
            <div key={section.id}>
              <h3 className="mb-1.5 flex justify-between text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <span>{section.label}</span>
                <span>{open.length ? `${open.length} open` : "Complete"}</span>
              </h3>
              <ul className="divide-y rounded-lg border">
                {open.length === 0 ? (
                  <li className="flex items-center gap-3 px-3.5 py-2.5 text-sm">
                    <CircleCheckIcon
                      className="size-4 text-success"
                      aria-hidden
                    />
                    <span className="font-medium">All inputs complete</span>
                  </li>
                ) : (
                  open.map((issue) => (
                    <li
                      key={issue.path}
                      className="flex items-center gap-3 px-3.5 py-2.5"
                      data-testid="review-issue"
                      data-path={issue.path}
                    >
                      {issue.kind === "invalid" ? (
                        <CircleAlertIcon
                          className="size-4 shrink-0 text-danger"
                          aria-hidden
                        />
                      ) : (
                        <CircleDashedIcon
                          className="size-4 shrink-0 text-warning"
                          aria-hidden
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">
                          {issue.label}
                        </span>
                        <span
                          className={cn(
                            "block text-xs",
                            issue.kind === "invalid"
                              ? "text-danger"
                              : "text-muted-foreground",
                          )}
                        >
                          {issue.kind === "invalid" ? "Invalid" : "Missing"} ·{" "}
                          {issue.message}
                        </span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onGoTo(issue)}
                      >
                        Go to field
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function KeyAssumptions() {
  const { control } = useFormContext<UnderwritingFormValues>();
  const values = useWatch({ control }) as UnderwritingFormValues;
  const { calculation: c } = useWorkspace();
  const p = values.purchase;
  const tags = DEAL_TAGS.filter((t) => values.tags[t.key]).length;
  const text = (v: string, suffix: string) =>
    v.trim() ? `${v}${suffix}` : "—";

  const rows: [string, React.ReactNode][] = [
    ["Purchase price", formatCurrency(parseInput(p.price))],
    [
      "Financing",
      `${text(p.downPaymentPct, "% down")} · ${text(p.interestRatePct, "%")} · ${text(p.termYears, " yr")}`,
    ],
    [
      "Setup spend",
      `${formatCurrency(c.optimizationTotal)} · ${pluralize(values.optimizationItems.length, "item")}`,
    ],
    [
      "Operating expenses",
      `${formatCurrency(c.monthlyOpex)}/mo · ${pluralize(values.operatingExpenses.length, "item")}`,
    ],
    [
      "Revenue · Low / Mid / High",
      <>
        {formatCompactCurrency(parseInput(values.revenue.low))} /{" "}
        <b>{formatCompactCurrency(parseInput(values.revenue.mid))}</b> /{" "}
        {formatCompactCurrency(parseInput(values.revenue.high))}
      </>,
    ],
    [
      "Co-hosting fee · Appreciation",
      `${text(values.coHostingFeePct || "0", "%")} · ${text(values.appreciationPct || "0", "%")}`,
    ],
    ["Deal tags", `${tags} selected`],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key assumptions</CardTitle>
        <CardDescription>
          A last look at what drives your numbers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="border-b py-2.5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function OfficialNumbers({
  official,
  saveStatus,
}: {
  official: UnderwritingDraft["official"];
  saveStatus: SaveStatus;
}) {
  const ready = official.totalOutOfPocket !== null;
  const rows: [string, string][] = [
    ["Total out of pocket", formatCurrency(official.totalOutOfPocket)],
    ["Mid revenue (graded)", formatCurrency(official.midRevenue)],
    [
      "Cash-on-cash · Low / Mid / High",
      `${pct(official.cashOnCash.low)} / ${pct(official.cashOnCash.mid)} / ${pct(official.cashOnCash.high)}`,
    ],
    ["PRR · Mid ÷ price", pct(official.prr)],
  ];

  return (
    <Card data-testid="official-numbers">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ServerIcon className="size-4 text-muted-foreground" aria-hidden />
          Calculated by the API
        </CardTitle>
        <CardDescription>
          {ready
            ? saveStatus === "saved"
              ? "From your last save. These are the numbers used when you submit."
              : "Saving your latest changes…"
            : "Appears once every required section is complete and saved."}
        </CardDescription>
      </CardHeader>
      {ready && (
        <CardContent>
          <dl className="divide-y text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 py-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      )}
    </Card>
  );
}

export function ReviewStep({
  official,
  saveStatus,
  onGoTo,
}: {
  official: UnderwritingDraft["official"];
  saveStatus: SaveStatus;
  onGoTo: (issue: FormIssue) => void;
}) {
  return (
    <>
      <Checklist onGoTo={onGoTo} />
      <KeyAssumptions />
      <OfficialNumbers official={official} saveStatus={saveStatus} />
    </>
  );
}
