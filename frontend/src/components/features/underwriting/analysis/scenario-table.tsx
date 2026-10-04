"use client";

import { useId, useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  ScenarioKey,
  ScenarioResult,
  UnderwritingCalculation,
} from "@/types/underwriting";

const COLUMNS: { key: ScenarioKey; label: string }[] = [
  { key: "low", label: "Low" },
  { key: "mid", label: "Mid · graded" },
  { key: "high", label: "High" },
];

const percent = (v: number | null | undefined) =>
  v == null ? "—" : `${v.toFixed(1)}%`;

interface Row {
  label: string;
  formula: string;
  value: (s: ScenarioResult, c: UnderwritingCalculation) => number | null;
  format?: "money" | "negative" | "percent";
  key?: boolean;
}

const ROWS: Row[] = [
  { label: "Gross revenue", formula: "your forecast", value: (s) => s.revenue },
  {
    label: "Operating expenses",
    formula: "monthly OPEX × 12 × 0.96 / 1 / 1.04",
    value: (s) => s.operatingExpenses,
    format: "negative",
  },
  {
    label: "Co-hosting fee",
    formula: "revenue × co-hosting fee %",
    value: (s) => s.coHostingFee,
    format: "negative",
  },
  {
    label: "Net operating income",
    formula: "revenue − operating expenses − co-hosting fee",
    value: (s) => s.netOperatingIncome,
    key: true,
  },
  {
    label: "Debt service",
    formula: "monthly mortgage × 12",
    value: (_, c) => c.annualDebtService,
    format: "negative",
  },
  {
    label: "Annual free cash flow",
    formula: "NOI − debt service",
    value: (s) => s.freeCashFlow,
    key: true,
  },
  {
    label: "Cash-on-cash return",
    formula: "free cash flow ÷ Total Out of Pocket × 100",
    value: (s) => s.cashOnCash,
    format: "percent",
    key: true,
  },
  {
    label: "Year-1 principal paydown",
    formula: "loan − balance after 12 payments",
    value: (_, c) => c.principalPaydown,
  },
  {
    label: "Appreciation",
    formula: "purchase price × annual appreciation %",
    value: (_, c) => c.appreciation,
  },
  {
    label: "Total real-estate return",
    formula:
      "(free cash flow + principal + appreciation) ÷ Total Out of Pocket × 100",
    value: (s) => s.totalReturn,
    format: "percent",
  },
];

function display(value: number | null, format: Row["format"]) {
  if (value === null) return "—";
  if (format === "percent") return percent(value);
  if (format === "negative") return formatCurrency(-value);
  return formatCurrency(value);
}

export function ScenarioTable({
  calculation,
}: {
  calculation: UnderwritingCalculation;
}) {
  const [showFormulas, setShowFormulas] = useState(false);
  const switchId = useId();

  return (
    <div>
      <div className="flex justify-end px-4 pb-3">
        <div className="flex items-center gap-2">
          <Switch
            id={switchId}
            checked={showFormulas}
            onCheckedChange={setShowFormulas}
          />
          <Label
            htmlFor={switchId}
            className="text-sm font-normal text-muted-foreground"
          >
            Show formulas
          </Label>
        </div>
      </div>
      <div className="overflow-x-auto border-t">
        <table
          className="w-full min-w-[520px] text-sm tabular-nums"
          data-testid="scenario-table"
        >
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground">
              <th className="px-4 py-2.5 text-left font-medium">Per year</th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-2.5 text-right font-medium",
                    col.key === "mid" && "bg-gold/15 text-[#8a5512]",
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.label}
                className={cn("border-t", row.key && "font-semibold")}
              >
                <td className="px-4 py-2.5">
                  {row.label}
                  {showFormulas && (
                    <span className="block font-mono text-[11px] font-normal text-muted-foreground">
                      {row.formula}
                    </span>
                  )}
                </td>
                {COLUMNS.map((col) => {
                  const scenario = calculation.scenarios[col.key];
                  const value = scenario
                    ? row.value(scenario, calculation)
                    : null;
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-2.5 text-right",
                        col.key === "mid" && "bg-gold/10",
                        value !== null &&
                          value < 0 &&
                          row.format !== "negative" &&
                          "text-danger",
                      )}
                    >
                      {display(value, row.format)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
