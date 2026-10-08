import { expect, test } from "@playwright/test";

import { countCompleted, getFormIssues } from "@/lib/underwriting/schema";
import type { UnderwritingFormValues } from "@/types/underwriting";

function values(
  operatingExpenses: UnderwritingFormValues["operatingExpenses"],
): UnderwritingFormValues {
  return {
    purchase: {
      price: "500000",
      downPaymentPct: "20",
      interestRatePct: "7",
      termYears: "30",
      closingCostsPct: "3",
    },
    optimizationItems: [],
    operatingExpenses,
    taxes: {
      landPct: "20",
      shortLifeAssetPct: "25",
      bonusDepreciationPct: "60",
      taxRatePct: "37",
    },
    revenue: { low: "100000", mid: "120000", high: "140000" },
    coHostingFeePct: "0",
    appreciationPct: "0",
    tags: {} as UnderwritingFormValues["tags"],
  };
}

test.describe("countCompleted", () => {
  test("counts every required input when the form is valid", () => {
    const issues = getFormIssues(
      values([{ label: "Utilities", amount: "300" }]),
    );
    expect(countCompleted(issues)).toEqual({ done: 13, total: 13 });
  });

  test("treats operating expenses as open when the list is empty", () => {
    expect(countCompleted(getFormIssues(values([])))).toEqual({
      done: 12,
      total: 13,
    });
  });

  test("treats operating expenses as open when a line is incomplete", () => {
    const issues = getFormIssues(values([{ label: "Utilities", amount: "" }]));
    expect(issues.map((i) => i.path)).toEqual(["operatingExpenses.0.amount"]);
    expect(countCompleted(issues)).toEqual({ done: 12, total: 13 });
  });
});
