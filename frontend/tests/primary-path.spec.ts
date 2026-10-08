import { expect, test } from "@playwright/test";

import { mockBackend, TEST_ZPID } from "./fixtures/mock-api";

test("trainee completes a case end to end and sees a Best result", async ({
  page,
}) => {
  await mockBackend(page, { submitRating: "best" });

  await page.goto("/");

  const card = page
    .getByTestId("case-card")
    .filter({ hasText: "4 Bluewater Ct" });
  await expect(card).toBeVisible();
  await card.getByRole("link", { name: "Start case" }).click();

  await expect(page).toHaveURL(`/properties/${TEST_ZPID}`);
  await page.getByTestId("property-cta").click();

  await page.waitForURL(/\/underwritings\/\d+/);

  await page.getByTestId("field-purchase.downPaymentPct").fill("25");
  await page.getByTestId("field-purchase.interestRatePct").fill("6.99");
  await page.getByTestId("field-purchase.termYears").fill("30");
  await page.getByTestId("field-purchase.closingCostsPct").fill("3");

  await page.getByRole("button", { name: "Add expense" }).click();
  await page.getByTestId("field-operatingExpenses.0.label").fill("Utilities");
  await page.getByTestId("field-operatingExpenses.0.amount").fill("350");

  await page.getByRole("button", { name: "Continue to Analysis" }).click();

  await page.getByTestId("field-revenue.low").fill("130000");
  await page.getByTestId("field-revenue.mid").fill("144000");
  await page.getByTestId("field-revenue.high").fill("160000");

  await page.getByRole("button", { name: "Continue to Deal tags" }).click();

  await page.getByTestId("tag-turnkey").getByRole("checkbox").click();
  await expect(page.getByTestId("tag-turnkey")).toHaveClass(/border-primary/);

  await page
    .getByRole("button", { name: "Continue to Review & submit" })
    .click();

  await expect(page.getByTestId("review-checklist")).toContainText(
    "Ready to submit",
  );
  const submitButton = page.getByTestId("submit-underwriting");
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await expect(page.getByTestId("submit-dialog")).toBeVisible();
  await page.getByTestId("confirm-submit").click();

  await page.waitForURL(/\/submissions\/\d+\?submitted=1/);
  await expect(
    page.getByRole("heading", { name: "Evaluation result" }),
  ).toBeVisible();
  const badge = page.getByTestId("score-badge").first();
  await expect(badge).toHaveAttribute("data-rating", "best");
  await expect(badge).toContainText("100");

  await expect(
    page.getByRole("link", { name: "Back to dashboard" }),
  ).toBeVisible();

  await expect(page.getByTestId("result-leaderboard")).toBeVisible();
});
