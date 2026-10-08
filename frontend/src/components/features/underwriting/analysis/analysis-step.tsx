"use client";

import { useFormContext, useWatch } from "react-hook-form";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NEW_DRAFT_ASSUMPTIONS } from "@/constants/underwriting";
import type { UnderwritingFormValues } from "@/types/underwriting";

import { NumericField } from "../fields/numeric-field";
import { SectionCard, SectionStatus } from "../section-card";
import { useWorkspace } from "../workspace-context";
import { ScenarioTable } from "./scenario-table";

export function AnalysisStep() {
  const { calculation } = useWorkspace();
  const { control } = useFormContext<UnderwritingFormValues>();
  const coHostingFeePct = useWatch({ control, name: "coHostingFeePct" });
  const appreciationPct = useWatch({ control, name: "appreciationPct" });
  const assumptionsUntouched =
    coHostingFeePct === NEW_DRAFT_ASSUMPTIONS.coHostingFeePct &&
    appreciationPct === NEW_DRAFT_ASSUMPTIONS.appreciationPct;

  return (
    <>
      <SectionCard
        id="section-revenue"
        title="Revenue forecasts"
        description="Your yearly gross revenue estimate for a cautious, expected and strong year."
        status={<SectionStatus sections={["revenue"]} />}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <NumericField
            name="revenue.low"
            kind="money"
            label="Low"
            help="Cautious year"
          />
          <NumericField
            name="revenue.mid"
            kind="money"
            label="Mid"
            help="Expected year · compared with the analyst"
            graded
          />
          <NumericField
            name="revenue.high"
            kind="money"
            label="High"
            help="Strong year"
          />
        </div>
      </SectionCard>

      <SectionCard
        id="section-assumptions"
        title="Assumptions"
        description="Both start at 0%; change them if they apply to this deal."
        status={
          <SectionStatus
            sections={["assumptions"]}
            optionalAndEmpty={assumptionsUntouched}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <NumericField
            name="coHostingFeePct"
            kind="percent"
            label="Co-hosting fee"
            help="Leave at 0 if self-managed"
          />
          <NumericField
            name="appreciationPct"
            kind="percent"
            label="Annual appreciation"
            help="Yearly growth in property value"
          />
        </div>
      </SectionCard>

      <Card className="gap-0 pb-0">
        <CardHeader className="pb-3">
          <CardTitle>Scenario analysis</CardTitle>
          <CardDescription>
            Worked out from your financials and forecasts as you type.
          </CardDescription>
        </CardHeader>
        <ScenarioTable calculation={calculation} />
      </Card>
    </>
  );
}
