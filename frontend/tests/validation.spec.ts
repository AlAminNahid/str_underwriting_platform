import { expect, test } from "@playwright/test";

import { mockBackend, TEST_UNDERWRITING_ID } from "./fixtures/mock-api";

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
});
