"use client";

import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { TRAINING_TAX_DEFAULTS } from "@/constants/underwriting";
import type { UnderwritingFormValues } from "@/types/underwriting";

import { CalculatedValues } from "../calculated-values";
import { NumericField } from "../fields/numeric-field";
import { SectionCard, SectionStatus } from "../section-card";
import { useWorkspace } from "../workspace-context";

export function TaxesSection() {
  const { setValue } = useFormContext<UnderwritingFormValues>();
  const { calculation: c } = useWorkspace();

  return (
    <SectionCard
      id="section-taxes"
      title="Taxes"
      description="Estimates first-year tax savings from cost-segregation depreciation."
      status={<SectionStatus sections={["taxes"]} />}
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setValue("taxes", TRAINING_TAX_DEFAULTS, {
              shouldDirty: true,
              shouldTouch: true,
            })
          }
        >
          Use training defaults
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <NumericField
          name="taxes.landPct"
          kind="percent"
          label="Land"
          placeholder="20"
        />
        <NumericField
          name="taxes.shortLifeAssetPct"
          kind="percent"
          label="Short-life assets"
          placeholder="25"
        />
        <NumericField
          name="taxes.bonusDepreciationPct"
          kind="percent"
          label="Bonus depreciation"
          placeholder="60"
        />
        <NumericField
          name="taxes.taxRatePct"
          kind="percent"
          label="Tax rate"
          placeholder="37"
        />
      </div>
      <CalculatedValues
        items={[
          { label: "Improvement basis", value: c.improvementBasis },
          { label: "Short-life assets", value: c.shortLifeAssets },
          { label: "Year-1 depreciation", value: c.yearOneDepreciation },
          { label: "Tax savings", value: c.taxSavings },
        ]}
      />
    </SectionCard>
  );
}
