import type { Page } from "@playwright/test";

export async function fillUnderwriting(page: Page, mid: number) {
  await page.getByTestId("field-purchase.downPaymentPct").fill("20");
  await page.getByTestId("field-purchase.interestRatePct").fill("7");
  await page.getByTestId("field-purchase.termYears").fill("30");
  await page.getByTestId("field-purchase.closingCostsPct").fill("3");
  await page.getByRole("button", { name: "Add expense" }).click();
  await page.getByTestId("field-operatingExpenses.0.label").fill("Utilities");
  await page.getByTestId("field-operatingExpenses.0.amount").fill("300");

  await page.getByRole("button", { name: "Continue to Analysis" }).click();
  await page
    .getByTestId("field-revenue.low")
    .fill(String(Math.round(mid * 0.9)));
  await page.getByTestId("field-revenue.mid").fill(String(mid));
  await page
    .getByTestId("field-revenue.high")
    .fill(String(Math.round(mid * 1.1)));

  await page.getByRole("button", { name: "Continue to Deal tags" }).click();
  await page
    .getByRole("button", { name: "Continue to Review & submit" })
    .click();
}

export async function submitForGrading(page: Page) {
  await page.getByTestId("submit-underwriting").click();
  await page.getByTestId("confirm-submit").click();
}

export const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
