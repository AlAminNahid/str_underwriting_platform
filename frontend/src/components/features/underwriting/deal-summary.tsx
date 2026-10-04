"use client";

import { InfoIcon } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { countCompleted } from "@/lib/underwriting/schema";
import { cn } from "@/lib/utils";
import type { ScenarioKey } from "@/types/underwriting";

import { useWorkspace } from "./workspace-context";

const pct = (v: number | null | undefined) =>
  v == null ? "—" : `${v.toFixed(1)}%`;

function Metric({
  step,
  label,
  value,
  detail,
  highlight,
  negative,
}: {
  step: string;
  label: string;
  value: string;
  detail?: string;
  highlight?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-0.5 border-t px-5 py-3.5",
        highlight && "bg-gold/10",
      )}
    >
      <p className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="text-[11px] font-semibold text-muted-foreground/60 tabular-nums">
          {step}
        </span>
      </p>
      <p
        className={cn(
          "text-[1.4rem] leading-tight font-semibold tracking-tight tabular-nums",
          negative && "text-danger",
          value === "—" && "text-muted-foreground/50",
        )}
      >
        {value}
      </p>
      {detail && (
        <p className="text-xs text-muted-foreground tabular-nums">{detail}</p>
      )}
    </div>
  );
}

export function DealSummary() {
  const { calculation: c, issues } = useWorkspace();
  const { done, total } = countCompleted(issues);
  const mid = c.scenarios.mid;
  const cocValues = (["low", "mid", "high"] as ScenarioKey[]).map(
    (key) => c.scenarios[key]?.cashOnCash ?? null,
  );
  const scale = Math.max(10, ...cocValues.map((v) => Math.abs(v ?? 0)));
  const hasCoc = cocValues.some((v) => v !== null);

  const oopDetail =
    c.totalOutOfPocket === null
      ? "Needs down payment and closing costs"
      : `${formatCurrency(c.downPayment)} down · ${formatCurrency(c.closingCosts)} closing · ${formatCurrency(c.optimizationTotal)} setup`;
  const fcfDetail =
    mid?.freeCashFlow != null
      ? `NOI ${formatCurrency(mid.netOperatingIncome)} − debt service ${formatCurrency(c.annualDebtService)}`
      : c.annualDebtService === null && !mid
        ? "Needs financing and Mid revenue"
        : c.annualDebtService === null
          ? "Needs down payment, interest rate and loan term"
          : "Needs Mid revenue";

  return (
    <Card className="gap-0 py-0" data-testid="deal-summary">
      <CardHeader className="px-5 pt-4 pb-4">
        <CardTitle className="text-[15px] font-semibold">
          Deal summary
        </CardTitle>
        <CardDescription className="text-[13px]">
          Updates as you type
        </CardDescription>
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Required inputs</span>
            <span
              className="font-semibold tabular-nums"
              data-testid="required-progress"
            >
              {done} of {total}
            </span>
          </div>
          <Progress
            value={(done / total) * 100}
            aria-label={`${done} of ${total} required inputs`}
            className="[&_[data-slot=progress-track]]:h-1.5"
          />
        </div>
      </CardHeader>

      <Metric
        step="01"
        label="Total out of pocket"
        value={formatCurrency(c.totalOutOfPocket)}
        detail={oopDetail}
      />
      <Metric
        step="02"
        label="Annual free cash flow · Mid"
        value={formatCurrency(mid?.freeCashFlow)}
        negative={(mid?.freeCashFlow ?? 0) < 0}
        detail={fcfDetail}
      />
      <div className="space-y-2 border-t bg-gold/10 px-5 py-3.5">
        <p className="flex justify-between text-xs text-muted-foreground">
          <span>Cash-on-cash return</span>
          <span className="text-[11px] font-semibold text-muted-foreground/60 tabular-nums">
            03
          </span>
        </p>
        {!hasCoc ? (
          <p className="text-xs text-muted-foreground">
            Needs financing and revenue forecasts
          </p>
        ) : (
          (["Low", "Mid", "High"] as const).map((label, i) => {
            const v = cocValues[i];
            const width =
              v === null ? 0 : Math.min(100, (Math.abs(v) / scale) * 100);
            return (
              <div
                key={label}
                className="grid grid-cols-[34px_1fr_54px] items-center gap-2 text-xs"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                  {v !== null && (
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        v >= 0 ? "bg-primary" : "bg-danger",
                      )}
                      style={{ width: `${width}%` }}
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "text-right font-semibold tabular-nums",
                    v !== null && v < 0 && "text-danger",
                  )}
                >
                  {pct(v)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <dl className="divide-y border-t px-5 py-1 text-[13px]">
        {[
          [
            "Net operating income · Mid",
            formatCurrency(mid?.netOperatingIncome),
          ],
          ["Monthly mortgage", formatCurrency(c.monthlyPayment)],
          ["Year-1 tax savings", formatCurrency(c.taxSavings)],
          ["First-year return incl. tax", formatCurrency(c.firstYearReturn)],
          ["PRR · Mid ÷ price", pct(c.prr)],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 py-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="flex gap-1.5 px-5 pt-1 pb-4 text-xs text-muted-foreground/80">
        <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden />
        Estimated in your browser with the brief&apos;s formulas. The API
        recalculates when your draft is saved.
      </p>
    </Card>
  );
}
