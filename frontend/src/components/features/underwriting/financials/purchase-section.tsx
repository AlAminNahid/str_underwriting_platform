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
          placeholder="20"
          help="Typically 20–25%"
        />
        <NumericField
          name="purchase.interestRatePct"
          kind="percent"
          label="Interest rate"
          placeholder="6.99"
          help="Annual rate"
        />
        <NumericField
          name="purchase.termYears"
          kind="years"
          label="Loan term"
          placeholder="30"
        />
        <NumericField
          name="purchase.closingCostsPct"
          kind="percent"
          label="Closing costs"
          placeholder="3"
          help="% of purchase price"
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
