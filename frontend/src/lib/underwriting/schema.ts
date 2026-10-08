import { z } from "zod";

import type {
  FormIssue,
  IssueKind,
  SectionId,
  UnderwritingFormValues,
  WorkspaceStep,
} from "@/types/underwriting";

const REQUIRED = "This field is required";
const NO_EXPENSES = "Add at least one monthly expense";

interface NumberRule {
  min?: number;
  max?: number;
  greaterThan?: boolean;
  integer?: boolean;
  optional?: boolean;
}

function numberInput({
  min = 0,
  max,
  greaterThan,
  integer,
  optional,
}: NumberRule = {}) {
  return z.string().superRefine((raw, ctx) => {
    const value = raw.trim();
    if (!value) {
      if (!optional) ctx.addIssue({ code: "custom", message: REQUIRED });
      return;
    }
    const n = Number(value);
    if (!Number.isFinite(n)) {
      ctx.addIssue({ code: "custom", message: "Enter a valid number" });
    } else if (greaterThan ? n <= min : n < min) {
      ctx.addIssue({
        code: "custom",
        message: greaterThan
          ? `Must be greater than ${min}`
          : "Cannot be negative",
      });
    } else if (max !== undefined && n > max) {
      ctx.addIssue({ code: "custom", message: `Must be ${max} or less` });
    } else if (integer && !Number.isInteger(n)) {
      ctx.addIssue({ code: "custom", message: "Use a whole number" });
    }
  });
}

const percentInput = (rule: NumberRule = {}) =>
  numberInput({ max: 100, ...rule });

const lineItem = z
  .object({ label: z.string(), amount: z.string() })
  .superRefine(({ label, amount }, ctx) => {
    const name = label.trim();
    const value = amount.trim();
    if (!name && !value) {
      ctx.addIssue({
        code: "custom",
        path: ["label"],
        message: "Empty line. Fill it in or remove it",
      });
      return;
    }
    if (!name)
      ctx.addIssue({ code: "custom", path: ["label"], message: REQUIRED });
    if (!value) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: REQUIRED });
    } else if (!Number.isFinite(Number(value))) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Enter a valid number",
      });
    } else if (Number(value) < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Cannot be negative",
      });
    }
  });

export const purchaseSchema = z.object({
  price: numberInput({ greaterThan: true }),
  downPaymentPct: percentInput(),
  interestRatePct: percentInput(),
  termYears: numberInput({ greaterThan: true, max: 50, integer: true }),
  closingCostsPct: percentInput(),
});

export const taxesSchema = z.object({
  landPct: percentInput(),
  shortLifeAssetPct: percentInput(),
  bonusDepreciationPct: percentInput(),
  taxRatePct: percentInput(),
});

export const revenueSchema = z
  .object({ low: numberInput(), mid: numberInput(), high: numberInput() })
  .superRefine(({ low, mid, high }, ctx) => {
    const [l, m, h] = [low, mid, high].map((v) => (v.trim() ? Number(v) : NaN));
    if (Number.isFinite(l) && Number.isFinite(m) && l > m) {
      ctx.addIssue({
        code: "custom",
        path: ["low"],
        message: "Low cannot be higher than Mid",
      });
    }
    if (Number.isFinite(h) && Number.isFinite(m) && h < m) {
      ctx.addIssue({
        code: "custom",
        path: ["high"],
        message: "High cannot be lower than Mid",
      });
    }
  });

export const assumptionsSchema = z.object({
  coHostingFeePct: percentInput({ optional: true }),
  appreciationPct: percentInput({ optional: true }),
});

export const underwritingSchema = z.object({
  purchase: purchaseSchema,
  optimizationItems: z.array(lineItem),
  operatingExpenses: z.array(lineItem).min(1, { message: NO_EXPENSES }),
  taxes: taxesSchema,
  revenue: revenueSchema,
  coHostingFeePct: assumptionsSchema.shape.coHostingFeePct,
  appreciationPct: assumptionsSchema.shape.appreciationPct,
  tags: z.record(z.string(), z.boolean()),
});

const FIELD_LABELS: Record<string, string> = {
  "purchase.price": "Purchase price",
  "purchase.downPaymentPct": "Down payment",
  "purchase.interestRatePct": "Interest rate",
  "purchase.termYears": "Loan term",
  "purchase.closingCostsPct": "Closing costs",
  "taxes.landPct": "Land",
  "taxes.shortLifeAssetPct": "Short-life assets",
  "taxes.bonusDepreciationPct": "Bonus depreciation",
  "taxes.taxRatePct": "Tax rate",
  "revenue.low": "Low revenue",
  "revenue.mid": "Mid revenue",
  "revenue.high": "High revenue",
  coHostingFeePct: "Co-hosting fee",
  appreciationPct: "Annual appreciation",
  operatingExpenses: "Operating expenses",
};

function locate(path: string): {
  section: SectionId;
  step: WorkspaceStep;
  label: string;
} {
  const [root, index] = path.split(".");
  const line = Number(index) + 1;
  switch (root) {
    case "purchase":
      return {
        section: "purchase",
        step: "financials",
        label: FIELD_LABELS[path],
      };
    case "taxes":
      return {
        section: "taxes",
        step: "financials",
        label: FIELD_LABELS[path],
      };
    case "optimizationItems":
      return {
        section: "optimization",
        step: "financials",
        label: `Optimization item, line ${line}`,
      };
    case "operatingExpenses":
      return {
        section: "opex",
        step: "financials",
        label:
          index === undefined
            ? FIELD_LABELS.operatingExpenses
            : `Operating expense, line ${line}`,
      };
    case "revenue":
      return {
        section: "revenue",
        step: "analysis",
        label: FIELD_LABELS[path],
      };
    default:
      return {
        section: "assumptions",
        step: "analysis",
        label: FIELD_LABELS[path] ?? path,
      };
  }
}

export function getFormIssues(values: UnderwritingFormValues): FormIssue[] {
  const result = underwritingSchema.safeParse(values);
  if (result.success) return [];
  return result.error.issues.map((issue) => {
    const path = issue.path.join(".");
    const kind: IssueKind =
      issue.message === REQUIRED || issue.message === NO_EXPENSES
        ? "missing"
        : "invalid";
    return { path, message: issue.message, kind, ...locate(path) };
  });
}

export const REQUIRED_PATHS = [
  "purchase.price",
  "purchase.downPaymentPct",
  "purchase.interestRatePct",
  "purchase.termYears",
  "purchase.closingCostsPct",
  "operatingExpenses",
  "taxes.landPct",
  "taxes.shortLifeAssetPct",
  "taxes.bonusDepreciationPct",
  "taxes.taxRatePct",
  "revenue.low",
  "revenue.mid",
  "revenue.high",
] as const;

export function countCompleted(issues: FormIssue[]) {
  const isOpen = (path: string) =>
    issues.some((i) => i.path === path || i.path.startsWith(`${path}.`));
  return {
    done: REQUIRED_PATHS.filter((p) => !isOpen(p)).length,
    total: REQUIRED_PATHS.length,
  };
}
