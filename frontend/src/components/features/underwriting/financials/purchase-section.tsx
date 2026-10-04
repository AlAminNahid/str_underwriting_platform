"use client";

import { CalculatedValues } from "../calculated-values";
import { NumericField } from "../fields/numeric-field";
import { SectionCard, SectionStatus } from "../section-card";
import { useWorkspace } from "../workspace-context";

export function PurchaseSection() {
  const { calculation: c } = useWorkspace();

  return (
    <SectionCard
      id="section-purchase"
      title="Purchase & financing"
      description="Sets the loan, the monthly mortgage and the cash needed at closing."
      status={<SectionStatus sections={["purchase"]} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <NumericField
          name="purchase.price"
          kind="money"
          label="Purchase price"
          help="Filled in from the listing"
        />
        <NumericField
          name="purchase.downPaymentPct"
          kind="percent"
          label="Down payment"
          help="Usually 20–25%"
        />
        <NumericField
          name="purchase.interestRatePct"
          kind="percent"
          label="Interest rate"
          help="Annual rate, e.g. 6.99%"
        />
        <NumericField
          name="purchase.termYears"
          kind="years"
          label="Loan term"
          help="Usually 15 or 30 years"
        />
        <NumericField
          name="purchase.closingCostsPct"
          kind="percent"
          label="Closing costs"
          help="Usually 2–5% of the price"
        />
      </div>
      <CalculatedValues
        items={[
          { label: "Down payment", value: c.downPayment },
          { label: "Loan amount", value: c.loanAmount },
          { label: "Closing costs", value: c.closingCosts },
          { label: "Monthly mortgage", value: c.monthlyPayment },
        ]}
      />
    </SectionCard>
  );
}
