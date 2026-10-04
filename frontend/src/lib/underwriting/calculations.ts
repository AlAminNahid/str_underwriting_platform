import { OPEX_MULTIPLIERS } from "@/constants/underwriting";
import type {
  ScenarioKey,
  ScenarioResult,
  UnderwritingCalculation,
  UnderwritingFormValues,
} from "@/types/underwriting";

export function parseInput(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

const sumAmounts = (rows: { amount: string }[]) =>
  rows.reduce((total, row) => total + (parseInput(row.amount) ?? 0), 0);

export function monthlyPayment(
  loan: number,
  monthlyRate: number,
  payments: number,
) {
  if (loan <= 0) return 0;
  if (monthlyRate === 0) return loan / payments;
  const growth = (1 + monthlyRate) ** payments;
  return (loan * monthlyRate * growth) / (growth - 1);
}

export function yearOnePrincipal(
  loan: number,
  monthlyRate: number,
  payment: number,
) {
  if (monthlyRate === 0) return payment * 12;
  let balance = loan;
  let paid = 0;
  for (let month = 0; month < 12; month++) {
    const principal = payment - balance * monthlyRate;
    paid += principal;
    balance -= principal;
  }
  return paid;
}

export function calculateUnderwriting(
  values: UnderwritingFormValues,
): UnderwritingCalculation {
  const price = parseInput(values.purchase.price);
  const downPct = parseInput(values.purchase.downPaymentPct);
  const ratePct = parseInput(values.purchase.interestRatePct);
  const years = parseInput(values.purchase.termYears);
  const closingPct = parseInput(values.purchase.closingCostsPct);

  const optimizationTotal = sumAmounts(values.optimizationItems);
  const monthlyOpex = sumAmounts(values.operatingExpenses);
  const annualOpex = monthlyOpex * 12;

  const downPayment =
    price !== null && downPct !== null ? price * (downPct / 100) : null;
  const loanAmount =
    price !== null && downPct !== null ? price * (1 - downPct / 100) : null;
  const closingCosts =
    price !== null && closingPct !== null ? price * (closingPct / 100) : null;
  const totalOutOfPocket =
    downPayment !== null && closingCosts !== null
      ? downPayment + closingCosts + optimizationTotal
      : null;

  let monthly: number | null = null;
  let principalPaydown: number | null = null;
  if (loanAmount !== null && ratePct !== null && years !== null && years > 0) {
    const monthlyRate = ratePct / 100 / 12;
    monthly = monthlyPayment(loanAmount, monthlyRate, years * 12);
    principalPaydown = yearOnePrincipal(loanAmount, monthlyRate, monthly);
  }
  const annualDebtService = monthly === null ? null : monthly * 12;

  const land = parseInput(values.taxes.landPct);
  const sla = parseInput(values.taxes.shortLifeAssetPct);
  const bonus = parseInput(values.taxes.bonusDepreciationPct);
  const taxRate = parseInput(values.taxes.taxRatePct);
  const improvementBasis =
    price !== null && land !== null
      ? price * (1 - land / 100) + optimizationTotal
      : null;
  const shortLifeAssets =
    improvementBasis !== null && sla !== null
      ? improvementBasis * (sla / 100)
      : null;
  const yearOneDepreciation =
    shortLifeAssets !== null && bonus !== null
      ? shortLifeAssets * (bonus / 100)
      : null;
  const taxSavings =
    yearOneDepreciation !== null && taxRate !== null
      ? yearOneDepreciation * (taxRate / 100)
      : null;

  const coHostPct = parseInput(values.coHostingFeePct) ?? 0;
  const appreciationPct = parseInput(values.appreciationPct) ?? 0;
  const appreciation = price === null ? null : price * (appreciationPct / 100);

  const scenarios: UnderwritingCalculation["scenarios"] = {};
  for (const key of ["low", "mid", "high"] as ScenarioKey[]) {
    const revenue = parseInput(values.revenue[key]);
    if (revenue === null) continue;
    const operatingExpenses = annualOpex * OPEX_MULTIPLIERS[key];
    const coHostingFee = revenue * (coHostPct / 100);
    const netOperatingIncome = revenue - operatingExpenses - coHostingFee;
    const freeCashFlow =
      annualDebtService === null
        ? null
        : netOperatingIncome - annualDebtService;
    const canDivide = freeCashFlow !== null && totalOutOfPocket !== null;
    const result: ScenarioResult = {
      revenue,
      operatingExpenses,
      coHostingFee,
      netOperatingIncome,
      freeCashFlow,
      cashOnCash: canDivide
        ? totalOutOfPocket > 0
          ? (freeCashFlow / totalOutOfPocket) * 100
          : 0
        : null,
      totalReturn:
        canDivide && principalPaydown !== null && totalOutOfPocket > 0
          ? ((freeCashFlow + principalPaydown + (appreciation ?? 0)) /
              totalOutOfPocket) *
            100
          : null,
    };
    scenarios[key] = result;
  }

  const mid = scenarios.mid;
  return {
    downPayment,
    loanAmount,
    closingCosts,
    optimizationTotal,
    totalOutOfPocket,
    monthlyPayment: monthly,
    annualDebtService,
    principalPaydown,
    monthlyOpex,
    annualOpex,
    improvementBasis,
    shortLifeAssets,
    yearOneDepreciation,
    taxSavings,
    appreciation,
    scenarios,
    prr: mid && price ? (mid.revenue / price) * 100 : null,
    firstYearReturn:
      mid?.freeCashFlow != null && taxSavings !== null
        ? mid.freeCashFlow + taxSavings
        : null,
  };
}
