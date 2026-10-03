import type { TrainingCase } from "@/types/training";

import { CaseCard } from "./case-card";

export const CASE_GRID_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export function CaseGrid({ cases }: { cases: TrainingCase[] }) {
  return (
    <div className={CASE_GRID_CLASS} data-testid="case-grid">
      {cases.map((c, index) => (
        <CaseCard key={c.zpid} trainingCase={c} priority={index < 4} />
      ))}
    </div>
  );
}
