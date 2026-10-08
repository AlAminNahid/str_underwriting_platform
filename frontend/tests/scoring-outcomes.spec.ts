import { expect, test } from "@playwright/test";

import { SCORING_CASES } from "./fixtures/brief-cases";
import { mockBackend } from "./fixtures/mock-api";
import { fillUnderwriting, submitForGrading, usd } from "./fixtures/workspace";

const HEADLINES = {
  best: "Within the Best band",
  medium: "Close, but outside the Best band",
  low: "Outside the scoring range",
} as const;

for (const { property, mid, rating, score, edge } of SCORING_CASES) {
  test(`${property.street}: Mid ${usd(mid)} (${edge}) grades ${rating}`, async ({
    page,
  }) => {
    const { calls } = await mockBackend(page, {
      property,
      initialStatus: "in_progress",
    });
    await page.goto(`/underwritings/${property.underwritingId}`);

    await fillUnderwriting(page, mid);
    await submitForGrading(page);
    await page.waitForURL(/\/submissions\/\d+/);

    const sent = calls.submitPayloads[0] as {
      forecasted_revenue: {
        scenarios: { mid: { forecasted_revenue: string } };
      };
    };
    expect(sent.forecasted_revenue.scenarios.mid.forecasted_revenue).toBe(
      String(mid),
    );

    const badge = page.getByTestId("score-badge").first();
    await expect(badge).toHaveAttribute("data-rating", rating);
    await expect(badge).toContainText(String(score));
    await expect(
      page.getByRole("heading", { name: HEADLINES[rating] }),
    ).toBeVisible();
    await expect(
      page.getByText(`Your Mid forecast of ${usd(mid)} was`),
    ).toBeVisible();
    await expect(
      page.getByText(`analyst's ${usd(property.referenceMid)}`).first(),
    ).toBeVisible();
  });
}
