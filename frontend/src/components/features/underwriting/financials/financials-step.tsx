"use client";

import {
  OPEX_SUGGESTIONS,
  OPTIMIZATION_SUGGESTIONS,
} from "@/constants/underwriting";
import { formatCurrency } from "@/lib/format";

import { useWorkspace } from "../workspace-context";
import { LineItemsSection } from "./line-items-section";
import { PurchaseSection } from "./purchase-section";
import { TaxesSection } from "./taxes-section";

export function FinancialsStep() {
  const { calculation: c } = useWorkspace();

  return (
    <>
      <PurchaseSection />
      <LineItemsSection
        name="optimizationItems"
        section="optimization"
        optional
        title="Optimization list"
        description="One-time setup spend before the first guest arrives. Adds to Total Out of Pocket and the depreciable value."
        nameLabel="Category"
        namePlaceholder="e.g. Hot tub"
        amountLabel="Amount"
        addLabel="Add item"
        suggestions={OPTIMIZATION_SUGGESTIONS}
        emptyText="No setup items yet. Most furnished rentals start with furniture & design."
        totals={
          <span>
            Total{" "}
            <b className="ml-1 text-foreground">
              {formatCurrency(c.optimizationTotal)}
            </b>
          </span>
        }
      />
      <LineItemsSection
        name="operatingExpenses"
        section="opex"
        title="Operating expenses"
        description="Recurring monthly costs. The Low and High scenarios adjust the yearly total by ×0.96 and ×1.04."
        nameLabel="Expense"
        namePlaceholder="e.g. Utilities"
        amountLabel="Monthly amount"
        monthly
        addLabel="Add expense"
        suggestions={OPEX_SUGGESTIONS}
        emptyText="No expenses yet. Add the recurring monthly costs, like utilities and insurance."
        totals={
          <>
            <span>
              Monthly{" "}
              <b className="ml-1 text-foreground">
                {formatCurrency(c.monthlyOpex)}
              </b>
            </span>
            <span className="hidden sm:inline">
              Annual{" "}
              <b className="ml-1 text-foreground">
                {formatCurrency(c.annualOpex)}
              </b>
            </span>
          </>
        }
      />
      <TaxesSection />
    </>
  );
}
