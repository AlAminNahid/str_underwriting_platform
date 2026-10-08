import { expect, test } from "@playwright/test";

import { toSavePayload } from "@/lib/underwriting/form-mapper";
import type { UnderwritingFormValues } from "@/types/underwriting";

function values(
  overrides: Partial<UnderwritingFormValues> = {},
): UnderwritingFormValues {
  return {
    purchase: {
      price: "540000",
      downPaymentPct: "25",
      interestRatePct: "6.99",
      termYears: "30",
      closingCostsPct: "3",
    },
    optimizationItems: [],
    operatingExpenses: [{ label: "Utilities", amount: "350" }],
    taxes: {
      landPct: "20",
      shortLifeAssetPct: "25",
      bonusDepreciationPct: "60",
      taxRatePct: "37",
    },
    revenue: { low: "130000", mid: "144000", high: "160000" },
    coHostingFeePct: "",
    appreciationPct: "3.5",
    tags: {} as UnderwritingFormValues["tags"],
    ...overrides,
  };
}

test.describe("toSavePayload", () => {
  test("converts whole-number percentages to API fractions", () => {
    const payload = toSavePayload(values());
    expect(payload.purchase_details).toEqual({
      purchase_price: "540000",
      down_payment_pct: "0.25",
      interest_rate: "0.0699",
      mortgage_years: 30,
      closing_costs_pct: "0.03",
    });
    expect(payload.taxes).toEqual({
      land_assumptions_pct: "0.2",
      sla_multiplier_pct: "0.25",
      bonus_amount_pct: "0.6",
      tax_rate_pct: "0.37",
    });
    expect(payload.forecasted_revenue).toMatchObject({
      co_hosting_fee_pct: "0",
      annual_re_appreciation_pct: "0.035",
    });
  });

  test("leaves out sections that are incomplete or invalid", () => {
    const payload = toSavePayload(
      values({
        purchase: { ...values().purchase, interestRatePct: "" },
        revenue: { low: "150000", mid: "144000", high: "160000" },
      }),
    );
    expect(payload.purchase_details).toBeUndefined();
    expect(payload.forecasted_revenue).toBeUndefined();
    expect(payload.taxes).toBeDefined();
  });

  test("keeps half-filled line items and drops empty ones", () => {
    const payload = toSavePayload(
      values({
        operatingExpenses: [
          { label: "Internet", amount: "" },
          { label: "", amount: "" },
          { label: "Insurance", amount: "-5" },
        ],
      }),
    );
    expect(payload.operating_expenses).toEqual([
      { expense_name: "Internet", monthly_amount: null },
      { expense_name: "Insurance", monthly_amount: null },
    ]);
  });
});
