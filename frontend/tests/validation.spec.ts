import { expect, test } from "@playwright/test";

import { mockBackend, TEST_UNDERWRITING_ID } from "./fixtures/mock-api";
import { fillUnderwriting } from "./fixtures/workspace";

test.describe("validation", () => {
  test("submitting is blocked until every required field is complete, and Review lists exactly what's missing", async ({
    page,
  }) => {
    await mockBackend(page, { initialStatus: "in_progress" });
    await page.goto(`/underwritings/${TEST_UNDERWRITING_ID}`);

    await page.getByRole("button", { name: "Continue to Analysis" }).click();
    await page.getByRole("button", { name: "Continue to Deal tags" }).click();
    await page
      .getByRole("button", { name: "Continue to Review & submit" })
      .click();

    await expect(page.getByTestId("review-checklist")).toContainText(
      "need attention",
    );
    await expect(page.getByTestId("submit-underwriting")).toBeDisabled();

    await expect(page.getByTestId("review-issue")).toHaveCount(8);

    const firstIssue = page.getByTestId("review-issue").first();
    const path = await firstIssue.getAttribute("data-path");
    await firstIssue.getByRole("button", { name: "Go to field" }).click();

    await expect(page.getByTestId(`field-${path}`)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("an out-of-range value is flagged immediately, but an untouched required field is not just from navigating away", async ({
    page,
  }) => {
    await mockBackend(page, { initialStatus: "in_progress" });
    await page.goto(`/underwritings/${TEST_UNDERWRITING_ID}`);

    const interestRate = page.getByTestId("field-purchase.interestRatePct");
    await interestRate.fill("150");
    await interestRate.blur();
    await expect(interestRate).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Must be 100 or less")).toBeVisible();

    const downPayment = page.getByTestId("field-purchase.downPaymentPct");
    await downPayment.click();
    await page.getByRole("button", { name: "Continue to Analysis" }).click();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(downPayment).not.toHaveAttribute("aria-invalid", "true");
  });

  test("the API's numbers are hidden while the checklist has open items, so stale values are never shown", async ({
    page,
  }) => {
    await mockBackend(page, { initialStatus: "in_progress" });
    await page.goto(`/underwritings/${TEST_UNDERWRITING_ID}`);
    await fillUnderwriting(page, 150000);

    const official = page.getByTestId("official-numbers");
    await expect(page.getByTestId("action-bar")).toContainText(
      "All changes saved",
    );
    await expect(official).toContainText("Total out of pocket");

    await page.getByTestId("step-analysis").click();
    await page.getByTestId("field-revenue.low").fill("200000");
    await page.getByTestId("step-review").click();

    await expect(page.getByTestId("review-issue")).toHaveCount(1);
    await expect(official).not.toContainText("Total out of pocket");
    await expect(official).toContainText(
      "Appears once every item in the checklist is resolved",
    );
  });
});
