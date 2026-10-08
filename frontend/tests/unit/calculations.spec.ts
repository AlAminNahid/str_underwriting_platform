import { expect, test } from "@playwright/test";

import { calculateUnderwriting } from "@/lib/underwriting/calculations";
import type { UnderwritingFormValues } from "@/types/underwriting";

function inputs(
  overrides: Partial<UnderwritingFormValues> = {},
): UnderwritingFormValues {
  return {
    purchase: {
      price: "500000",
      downPaymentPct: "20",
      interestRatePct: "7",
      termYears: "30",
      closingCostsPct: "3",
    },
    optimizationItems: [
      { label: "Furniture", amount: "40000" },
      { label: "Hot tub", amount: "20000" },
    ],
    operatingExpenses: [
      { label: "Utilities", amount: "500" },
      { label: "Insurance", amount: "300" },
    ],
    taxes: {
      landPct: "20",
      shortLifeAssetPct: "25",
      bonusDepreciationPct: "60",
      taxRatePct: "37",
    },
    revenue: { low: "100000", mid: "120000", high: "140000" },
    coHostingFeePct: "10",
    appreciationPct: "3",
    tags: {} as UnderwritingFormValues["tags"],
    ...overrides,
  };
}

test.describe("calculateUnderwriting matches the backend calculator", () => {
  const c = calculateUnderwriting(inputs());

  test("purchase, financing and total out of pocket", () => {
    expect(c.downPayment).toBeCloseTo(100000, 2);
    expect(c.loanAmount).toBeCloseTo(400000, 2);
    expect(c.closingCosts).toBeCloseTo(15000, 2);
    expect(c.optimizationTotal).toBeCloseTo(60000, 2);
    expect(c.totalOutOfPocket).toBeCloseTo(175000, 2);
  });

  test("debt service and year-one principal pay-down", () => {
    expect(c.monthlyPayment).toBeCloseTo(2661.21, 2);
    expect(c.annualDebtService).toBeCloseTo(31934.52, 2);
    expect(c.principalPaydown).toBeCloseTo(4063.24, 2);
  });

  test("cost segregation chain and tax savings", () => {
    expect(c.improvementBasis).toBeCloseTo(460000, 2);
    expect(c.shortLifeAssets).toBeCloseTo(115000, 2);
    expect(c.yearOneDepreciation).toBeCloseTo(69000, 2);
    expect(c.taxSavings).toBeCloseTo(25530, 2);
  });

  const expected = {
    low: {
      opex: 9216,
      fee: 10000,
      noi: 80784,
      fcf: 48849.48,
      coc: 27.91,
      total: 38.81,
    },
    mid: {
      opex: 9600,
      fee: 12000,
      noi: 98400,
      fcf: 66465.48,
      coc: 37.98,
      total: 48.87,
    },
    high: {
      opex: 9984,
      fee: 14000,
      noi: 116016,
      fcf: 84081.48,
      coc: 48.05,
      total: 58.94,
    },
  } as const;

  for (const [key, e] of Object.entries(expected)) {
    test(`${key} scenario`, () => {
      const s = c.scenarios[key as keyof typeof expected]!;
      expect(s.operatingExpenses).toBeCloseTo(e.opex, 2);
      expect(s.coHostingFee).toBeCloseTo(e.fee, 2);
      expect(s.netOperatingIncome).toBeCloseTo(e.noi, 2);
      expect(s.freeCashFlow).toBeCloseTo(e.fcf, 2);
      expect(s.cashOnCash).toBeCloseTo(e.coc, 2);
      expect(s.totalReturn).toBeCloseTo(e.total, 2);
    });
  }

  test("PRR and first-year return", () => {
    expect(c.prr).toBeCloseTo(24, 2);
    expect(c.appreciation).toBeCloseTo(15000, 2);
    expect(c.firstYearReturn).toBeCloseTo(66465.48 + 25530, 2);
  });
});

test.describe("calculateUnderwriting edge cases", () => {
  test("a 0% interest rate splits the loan evenly across payments", () => {
    const c = calculateUnderwriting(
      inputs({
        purchase: {
          price: "360000",
          downPaymentPct: "0",
          interestRatePct: "0",
          termYears: "30",
          closingCostsPct: "0",
        },
      }),
    );
    expect(c.monthlyPayment).toBeCloseTo(1000, 2);
    expect(c.principalPaydown).toBeCloseTo(12000, 2);
  });

  test("cash-on-cash is 0 when nothing is paid out of pocket", () => {
    const c = calculateUnderwriting(
      inputs({
        purchase: {
          price: "500000",
          downPaymentPct: "0",
          interestRatePct: "7",
          termYears: "30",
          closingCostsPct: "0",
        },
        optimizationItems: [],
      }),
    );
    expect(c.totalOutOfPocket).toBe(0);
    expect(c.scenarios.mid?.cashOnCash).toBe(0);
  });

  test("outputs that depend on missing inputs stay empty", () => {
    const c = calculateUnderwriting(
      inputs({
        purchase: {
          price: "500000",
          downPaymentPct: "",
          interestRatePct: "7",
          termYears: "30",
          closingCostsPct: "3",
        },
        revenue: { low: "", mid: "120000", high: "" },
      }),
    );
    expect(c.totalOutOfPocket).toBeNull();
    expect(c.annualDebtService).toBeNull();
    expect(c.scenarios.low).toBeUndefined();
    expect(c.scenarios.mid?.netOperatingIncome).toBeCloseTo(98400, 2);
    expect(c.scenarios.mid?.freeCashFlow).toBeNull();
  });
});
