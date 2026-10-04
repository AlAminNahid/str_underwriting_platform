"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { NumericField } from "../fields/numeric-field";
import { SectionCard, SectionStatus } from "../section-card";
import { useWorkspace } from "../workspace-context";
import { ScenarioTable } from "./scenario-table";

export function AnalysisStep() {
  const { calculation } = useWorkspace();

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
            placeholder="0"
            help="Cautious year"
          />
          <NumericField
            name="revenue.mid"
            kind="money"
            label="Mid"
            placeholder="0"
            help="Expected year · compared with the analyst"
            graded
          />
          <NumericField
            name="revenue.high"
            kind="money"
            label="High"
            placeholder="0"
            help="Strong year"
          />
        </div>
      </SectionCard>

      <SectionCard
        id="section-assumptions"
        title="Assumptions"
        description="Optional. Both count as 0% when left empty."
        status={<SectionStatus sections={["assumptions"]} />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <NumericField
            name="coHostingFeePct"
            kind="percent"
            label="Co-hosting fee"
            placeholder="0"
            help="Share of revenue paid to a co-host"
          />
          <NumericField
            name="appreciationPct"
            kind="percent"
            label="Annual appreciation"
            placeholder="3"
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
