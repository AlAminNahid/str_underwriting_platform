import { expect, test } from "@playwright/test";

import { mockBackend, TEST_UNDERWRITING_ID } from "./fixtures/mock-api";

test("resuming an in-progress case loads the saved draft instead of starting a new one", async ({
  page,
}) => {
  const { calls } = await mockBackend(page, {
    initialStatus: "in_progress",
    attempts: 0,
    seedDraft: {
      downPaymentPct: 20,
      interestRate: 7,
      mortgageYears: 30,
      closingCostsPct: 3.5,
    },
  });

  await page.goto("/");

  // The dashboard carries a second, untouched case alongside the one this
  // test resumes - the suite's fixture data spans more than one property.
  await expect(page.getByTestId("case-card")).toHaveCount(2);
  const otherCard = page
    .getByTestId("case-card")
    .filter({ hasText: "12 Harbor Light Ln" });
  await expect(otherCard.getByRole("link", { name: "Start case" })).toBeVisible();

  const card = page
    .getByTestId("case-card")
    .filter({ hasText: "4 Bluewater Ct" });
  await expect(card).toBeVisible();
  await expect(card).toContainText("Draft saved");

  const resumeLink = card.getByRole("link", { name: "Resume draft" });
  await expect(resumeLink).toBeVisible();
  await expect(card.getByRole("link", { name: "Start case" })).toHaveCount(0);

  await resumeLink.click();
  await expect(page).toHaveURL(`/underwritings/${TEST_UNDERWRITING_ID}`);

  await expect(page.getByTestId("field-purchase.downPaymentPct")).toHaveValue(
    "20",
  );
  await expect(page.getByTestId("field-purchase.interestRatePct")).toHaveValue(
    "7",
  );
  await expect(page.getByTestId("field-purchase.termYears")).toHaveValue("30");
  await expect(page.getByTestId("field-purchase.closingCostsPct")).toHaveValue(
    "3.5",
  );

  expect(calls.startUnderwritingCalls).toBe(0);
});
