import { expect, test } from "@playwright/test";

import { mockBackend, type PropertyKey } from "./fixtures/mock-api";

async function fillRequiredFieldsAndSubmit(
  page: import("@playwright/test").Page,
  underwritingId: number,
) {
  await page.goto(`/underwritings/${underwritingId}`);

  await page.getByTestId("field-purchase.downPaymentPct").fill("20");
  await page.getByTestId("field-purchase.interestRatePct").fill("7");
  await page.getByTestId("field-purchase.termYears").fill("30");
  await page.getByTestId("field-purchase.closingCostsPct").fill("3");
  await page.getByRole("button", { name: "Add expense" }).click();
  await page.getByTestId("field-operatingExpenses.0.label").fill("Utilities");
  await page.getByTestId("field-operatingExpenses.0.amount").fill("300");

  await page.getByRole("button", { name: "Continue to Analysis" }).click();
  await page.getByTestId("field-revenue.low").fill("120000");
  await page.getByTestId("field-revenue.mid").fill("135000");
  await page.getByTestId("field-revenue.high").fill("150000");

  await page.getByRole("button", { name: "Continue to Deal tags" }).click();
  await page
    .getByRole("button", { name: "Continue to Review & submit" })
    .click();

  await page.getByTestId("submit-underwriting").click();
  await page.getByTestId("confirm-submit").click();
  await page.waitForURL(/\/submissions\/\d+/);
}

test("a forecast within 25% but outside 10% grades Medium", async ({
  page,
}) => {
  const { property } = await mockBackend(page, {
    activeProperty: "A",
    initialStatus: "in_progress",
    submitRating: "medium",
  });
  await fillRequiredFieldsAndSubmit(page, property.underwritingId);

  const badge = page.getByTestId("score-badge").first();
  await expect(badge).toHaveAttribute("data-rating", "medium");
  await expect(badge).toContainText("70");
  await expect(
    page.getByRole("heading", { name: "Close, but outside the Best band" }),
  ).toBeVisible();
});

test("a forecast more than 25% off grades Low, on a different property than the rest of the suite", async ({
  page,
}) => {
  const activeProperty: PropertyKey = "B";
  const { property } = await mockBackend(page, {
    activeProperty,
    initialStatus: "in_progress",
    submitRating: "low",
  });
  await fillRequiredFieldsAndSubmit(page, property.underwritingId);

  await expect(page.getByText("12 Harbor Light Ln").first()).toBeVisible();
  const badge = page.getByTestId("score-badge").first();
  await expect(badge).toHaveAttribute("data-rating", "low");
  await expect(badge).toContainText("40");
  await expect(
    page.getByRole("heading", { name: "Outside the scoring range" }),
  ).toBeVisible();
});
