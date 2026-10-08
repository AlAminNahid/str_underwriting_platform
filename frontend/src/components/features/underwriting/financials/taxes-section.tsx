"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { TRAINING_TAX_DEFAULTS } from "@/constants/underwriting";
import type { UnderwritingFormValues } from "@/types/underwriting";

import { CalculatedValues } from "../calculated-values";
import { NumericField } from "../fields/numeric-field";
import { SectionCard, SectionStatus } from "../section-card";
import { useWorkspace } from "../workspace-context";

const TAX_FIELD_MEANING: Record<keyof typeof TRAINING_TAX_DEFAULTS, string> = {
  landPct: "Non-depreciable land",
  shortLifeAssetPct: "Fast-depreciating items",
  bonusDepreciationPct: "Deducted in year 1",
  taxRatePct: "Your marginal rate",
};

export function TaxesSection() {
  const { control, setValue } = useFormContext<UnderwritingFormValues>();
  const { calculation: c } = useWorkspace();
  const taxes = useWatch({ control, name: "taxes" });
  const isDefault = (key: keyof typeof TRAINING_TAX_DEFAULTS) =>
    Number(taxes[key]) === Number(TRAINING_TAX_DEFAULTS[key]) &&
    taxes[key].trim() !== "";
  const allDefaults = (
    Object.keys(TRAINING_TAX_DEFAULTS) as (keyof typeof TRAINING_TAX_DEFAULTS)[]
  ).every(isDefault);

  return (
    <SectionCard
      id="section-taxes"
      title="Taxes"
      description="Estimates first-year tax savings from cost-segregation depreciation. Starts at common training values — edit any of them to match your deal."
      status={<SectionStatus sections={["taxes"]} />}
      headerAction={
        !allDefaults && (
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
            Reset to training defaults
          </Button>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <NumericField
          name="taxes.landPct"
          help={TAX_FIELD_MEANING.landPct}
          kind="percent"
          label="Land"
        />
        <NumericField
          name="taxes.shortLifeAssetPct"
          help={TAX_FIELD_MEANING.shortLifeAssetPct}
          kind="percent"
          label="Short-life assets"
        />
        <NumericField
          name="taxes.bonusDepreciationPct"
          help={TAX_FIELD_MEANING.bonusDepreciationPct}
          kind="percent"
          label="Bonus depreciation"
        />
        <NumericField
          name="taxes.taxRatePct"
          help={TAX_FIELD_MEANING.taxRatePct}
          kind="percent"
          label="Tax rate"
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
