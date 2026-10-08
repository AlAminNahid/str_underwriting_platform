import { expect, test } from "@playwright/test";

import { mockBackend, TEST_UNDERWRITING_ID } from "./fixtures/mock-api";
import { fillUnderwriting, submitForGrading } from "./fixtures/workspace";

test("a failed autosave shows an error with Retry, and Retry saves the draft", async ({
  page,
}) => {
  const { calls } = await mockBackend(page, {
    initialStatus: "in_progress",
    failSaves: 1,
  });
  await page.goto(`/underwritings/${TEST_UNDERWRITING_ID}`);

  await page.getByRole("button", { name: "Add expense" }).click();
  await page.getByTestId("field-operatingExpenses.0.label").fill("Utilities");

  const actionBar = page.getByTestId("action-bar");
  await expect(actionBar.getByRole("alert")).toContainText("Couldn't save");
  const failedAttempts = calls.saveCalls;

  await page.getByTestId("field-operatingExpenses.0.amount").fill("300");
  await page.waitForTimeout(1500);
  expect(calls.saveCalls).toBe(failedAttempts);

  await actionBar.getByRole("button", { name: "Retry" }).click();
  await expect(actionBar).toContainText("All changes saved");
  expect(calls.saveCalls).toBe(failedAttempts + 1);
});

test("a failed submission keeps the trainee on the draft with an error, and a second try succeeds", async ({
  page,
}) => {
  const { calls } = await mockBackend(page, {
    initialStatus: "in_progress",
    failSubmits: 1,
  });
  await page.goto(`/underwritings/${TEST_UNDERWRITING_ID}`);
  await fillUnderwriting(page, 150000);
  await submitForGrading(page);

  const dialog = page.getByTestId("submit-dialog");
  await expect(dialog.getByRole("alert")).toContainText("Couldn't submit");
  await expect(page).toHaveURL(/\/underwritings\/\d+/);
  expect(calls.submitCalls).toBe(1);

  await page.getByTestId("confirm-submit").click();
  await page.waitForURL(/\/submissions\/\d+\?submitted=1/);
  await expect(page.getByTestId("score-badge").first()).toHaveAttribute(
    "data-rating",
    "best",
  );
  expect(calls.submitCalls).toBe(2);
});

test("submitting while an autosave is in flight waits for it, and no save is sent after submit", async ({
  page,
}) => {
  const { calls } = await mockBackend(page, {
    initialStatus: "in_progress",
    saveDelayMs: 2000,
  });
  await page.goto(`/underwritings/${TEST_UNDERWRITING_ID}`);
  await fillUnderwriting(page, 150000);
  await expect(page.getByTestId("action-bar")).toContainText(
    "All changes saved",
    { timeout: 15_000 },
  );

  await page.getByTestId("step-analysis").click();
  await page.getByTestId("field-revenue.high").fill("170000");
  await expect.poll(() => calls.events.at(-1)).toBe("save:start");
  await page.getByTestId("step-review").click();
  await submitForGrading(page);
  await page.waitForURL(/\/submissions\/\d+\?submitted=1/);

  const submitAt = calls.events.indexOf("submit");
  const before = calls.events.slice(0, submitAt);
  expect(before.filter((e) => e === "save:end")).toHaveLength(
    before.filter((e) => e === "save:start").length,
  );
  expect(calls.events.slice(submitAt + 1)).not.toContain("save:start");
});
