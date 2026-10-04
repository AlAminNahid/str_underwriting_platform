import type { DealTagsDto } from "@/types/api";

export type DealTagKey = keyof DealTagsDto;

export type WorkspaceStep = "financials" | "analysis" | "tags" | "review";

export type SectionId =
  | "purchase"
  | "optimization"
  | "opex"
  | "taxes"
  | "revenue"
  | "assumptions";

export interface LineItemValues {
  label: string;
  amount: string;
}

export interface UnderwritingFormValues {
  purchase: {
    price: string;
    downPaymentPct: string;
    interestRatePct: string;
    termYears: string;
    closingCostsPct: string;
  };
  optimizationItems: LineItemValues[];
  operatingExpenses: LineItemValues[];
  taxes: {
    landPct: string;
    shortLifeAssetPct: string;
    bonusDepreciationPct: string;
    taxRatePct: string;
  };
  revenue: { low: string; mid: string; high: string };
  coHostingFeePct: string;
  appreciationPct: string;
  tags: Record<DealTagKey, boolean>;
}

export type IssueKind = "missing" | "invalid";

export interface FormIssue {
  path: string;
  label: string;
  message: string;
  kind: IssueKind;
  section: SectionId;
  step: WorkspaceStep;
}

export type ScenarioKey = "low" | "mid" | "high";

export interface ScenarioResult {
  revenue: number;
  operatingExpenses: number;
  coHostingFee: number;
  netOperatingIncome: number;
  freeCashFlow: number | null;
  cashOnCash: number | null;
  totalReturn: number | null;
}

export interface UnderwritingCalculation {
  downPayment: number | null;
  loanAmount: number | null;
  closingCosts: number | null;
  optimizationTotal: number;
  totalOutOfPocket: number | null;
  monthlyPayment: number | null;
  annualDebtService: number | null;
  principalPaydown: number | null;
  monthlyOpex: number;
  annualOpex: number;
  improvementBasis: number | null;
  shortLifeAssets: number | null;
  yearOneDepreciation: number | null;
  taxSavings: number | null;
  appreciation: number | null;
  scenarios: Partial<Record<ScenarioKey, ScenarioResult>>;
  prr: number | null;
  firstYearReturn: number | null;
}

export interface UnderwritingDraft {
  id: number;
  zpid: string | null;
  street: string;
  city: string | null;
  state: string | null;
  marketId: number | null;
  listPrice: number | null;
  isReference: boolean;
  isSubmitted: boolean;
  updatedAt: string | null;
  values: UnderwritingFormValues;
  official: {
    totalOutOfPocket: number | null;
    midRevenue: number | null;
    prr: number | null;
    cashOnCash: { low: number | null; mid: number | null; high: number | null };
  };
}
