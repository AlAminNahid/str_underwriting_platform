import type { Page } from "@playwright/test";

export const API_BASE = "http://localhost:8000";

export type CaseStatus = "not_started" | "in_progress" | "submitted";
export type PropertyKey = "A" | "B";

interface PropertyFixture {
  zpid: string;
  underwritingId: number;
  price: number;
  address: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  beds: number;
  baths: number;
  area: number;
  market: { id: number; name: string; slug: string; state: string };
}

const PROPERTIES: Record<PropertyKey, PropertyFixture> = {
  A: {
    zpid: "90000001",
    underwritingId: 900001,
    price: 540000,
    address: "4 Bluewater Ct, Port Clyde, ME 04855",
    street: "4 Bluewater Ct",
    city: "Port Clyde",
    state: "ME",
    zipcode: "04855",
    beds: 3,
    baths: 2,
    area: 1800,
    market: {
      id: 9001,
      name: "Midcoast Maine",
      slug: "midcoast-maine",
      state: "ME",
    },
  },
  B: {
    zpid: "90000002",
    underwritingId: 900002,
    price: 610000,
    address: "12 Harbor Light Ln, Camden, ME 04843",
    street: "12 Harbor Light Ln",
    city: "Camden",
    state: "ME",
    zipcode: "04843",
    beds: 4,
    baths: 3,
    area: 2100,
    market: {
      id: 9002,
      name: "Penobscot Bay",
      slug: "penobscot-bay",
      state: "ME",
    },
  },
};

export const TEST_ZPID = PROPERTIES.A.zpid;
export const TEST_UNDERWRITING_ID = PROPERTIES.A.underwritingId;

function marketDto(p: PropertyFixture) {
  return {
    id: p.market.id,
    name: p.market.name,
    slug: p.market.slug,
    state: p.market.state,
    region: "New England",
    country: "US",
    timezone: "America/New_York",
    description: `A quiet coastal training market (${p.market.name}) used only by this Playwright suite.`,
    is_active: true,
    property_count: 1,
    created_at: "2026-01-01T00:00:00Z",
  };
}

function propertyDto(p: PropertyFixture) {
  return {
    zpid: p.zpid,
    img_src: null,
    detail_url: "https://example.com/listing",
    price: `$${p.price.toLocaleString("en-US")}`,
    unformatted_price: String(p.price),
    address: p.address,
    address_street: p.street,
    address_city: p.city,
    address_state: p.state,
    address_zipcode: p.zipcode,
    beds: p.beds,
    baths: p.baths,
    area: p.area,
    latitude: 43.93,
    longitude: -69.26,
    home_type: "SINGLE_FAMILY",
    home_status: "FOR_SALE",
    time_on_zillow: "12 days",
    flex_text: null,
    market_id: p.market.id,
    market: p.market,
    created_at: "2026-01-01T00:00:00Z",
  };
}

const SCORE_PROFILES = {
  best: { accuracy: 100, deviation: 0.04 },
  medium: { accuracy: 70, deviation: 0.16 },
  low: { accuracy: 40, deviation: 0.34 },
} as const;

export type Rating = keyof typeof SCORE_PROFILES;

const REFERENCE_MID = 150000;

function breakdownFor(rating: Rating) {
  const { accuracy, deviation } = SCORE_PROFILES[rating];
  const candidate = Math.round(REFERENCE_MID * (1 - deviation));
  return {
    rating,
    accuracy,
    metric: "mid_gross_revenue",
    label: "Mid revenue forecast",
    candidate,
    reference: REFERENCE_MID,
    deviation,
    best_threshold: 0.1,
    medium_threshold: 0.25,
  };
}

interface DraftFields {
  purchasePrice: number | null;
  downPaymentPct: number | null;
  interestRate: number | null;
  mortgageYears: number | null;
  closingCostsPct: number | null;
  optimizationItems: { category: string; total_price: number }[];
  operatingExpenses: { expense_name: string; monthly_amount: number }[];
  taxes: {
    land_assumptions_pct: number;
    sla_multiplier_pct: number;
    bonus_amount_pct: number;
    tax_rate_pct: number;
  } | null;
  revenueLow: number | null;
  revenueMid: number | null;
  revenueHigh: number | null;
  coHostingFeePct: number;
  appreciationPct: number;
  tags: Record<string, boolean>;
  updatedAt: string;
}

function emptyDraft(price: number): DraftFields {
  return {
    purchasePrice: price,
    downPaymentPct: null,
    interestRate: null,
    mortgageYears: null,
    closingCostsPct: null,
    optimizationItems: [],
    operatingExpenses: [],
    taxes: null,
    revenueLow: null,
    revenueMid: null,
    revenueHigh: null,
    coHostingFeePct: 0,
    appreciationPct: 0,
    tags: {},
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function underwritingDto(
  p: PropertyFixture,
  draft: DraftFields,
  submitted: boolean,
) {
  const hasPurchase =
    draft.downPaymentPct !== null &&
    draft.interestRate !== null &&
    draft.mortgageYears !== null &&
    draft.closingCostsPct !== null;
  const optimizationTotal = draft.optimizationItems.reduce(
    (s, i) => s + i.total_price,
    0,
  );
  const downPayment = hasPurchase
    ? (draft.purchasePrice ?? 0) * ((draft.downPaymentPct ?? 0) / 100)
    : null;
  const closingCosts = hasPurchase
    ? (draft.purchasePrice ?? 0) * ((draft.closingCostsPct ?? 0) / 100)
    : null;
  const totalOop =
    downPayment !== null && closingCosts !== null
      ? downPayment + closingCosts + optimizationTotal
      : null;

  return {
    id: p.underwritingId,
    zpid: p.zpid,
    market_id: p.market.id,
    is_reference: false,
    deal_status: submitted ? "analyst_completed" : null,
    deal_submitted: submitted ? draft.updatedAt : null,
    property_address: p.address,
    street: p.street,
    city: p.city,
    state: p.state,
    purchase_price: draft.purchasePrice,
    total_oop: totalOop,
    mid_gross_revenue: draft.revenueMid,
    prr:
      draft.revenueMid !== null && draft.purchasePrice
        ? draft.revenueMid / draft.purchasePrice
        : null,
    l_cash_on_cash: null,
    m_cash_on_cash: null,
    h_cash_on_cash: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: draft.updatedAt,
    detail: {
      purchase_details: hasPurchase
        ? {
            purchase_price: draft.purchasePrice,
            down_payment_pct: (draft.downPaymentPct ?? 0) / 100,
            interest_rate: (draft.interestRate ?? 0) / 100,
            mortgage_years: draft.mortgageYears,
            closing_costs_pct: (draft.closingCostsPct ?? 0) / 100,
          }
        : null,
      forecasted_revenue: {
        co_hosting_fee_pct: draft.coHostingFeePct / 100,
        annual_re_appreciation_pct: draft.appreciationPct / 100,
        scenarios: {
          low: { forecasted_revenue: draft.revenueLow },
          mid: { forecasted_revenue: draft.revenueMid },
          high: { forecasted_revenue: draft.revenueHigh },
        },
      },
      y1_coc_incl_tax_savings: null,
      zillow_property: null,
      analyst_notes: null,
    },
    taxes: draft.taxes
      ? {
          land_assumptions_pct: draft.taxes.land_assumptions_pct / 100,
          sla_multiplier_pct: draft.taxes.sla_multiplier_pct / 100,
          bonus_amount_pct: draft.taxes.bonus_amount_pct / 100,
          tax_rate_pct: draft.taxes.tax_rate_pct / 100,
          improvement_basis: null,
          estimated_short_life_assets: null,
          y1_loss_from_depreciation: null,
          tax_savings: null,
        }
      : null,
    optimization_items: draft.optimizationItems.map((i, idx) => ({
      id: idx + 1,
      category: i.category,
      total_price: i.total_price,
    })),
    operating_expenses: draft.operatingExpenses.map((e, idx) => ({
      id: idx + 1,
      expense_name: e.expense_name,
      monthly_amount: e.monthly_amount,
    })),
    turnkey: draft.tags.turnkey ?? false,
    furnished: draft.tags.furnished ?? false,
    luxury: draft.tags.luxury ?? false,
    tax_efficient: draft.tags.tax_efficient ?? false,
    new_construction: draft.tags.new_construction ?? false,
    existing_airbnb: draft.tags.existing_airbnb ?? false,
    arv: draft.tags.arv ?? false,
    high_cash_on_cash: draft.tags.high_cash_on_cash ?? false,
    low_cash_on_cash: draft.tags.low_cash_on_cash ?? false,
    add_inground_pool: draft.tags.add_inground_pool ?? false,
    waterfront: draft.tags.waterfront ?? false,
    remote: draft.tags.remote ?? false,
    can_support_cohost: draft.tags.can_support_cohost ?? false,
  };
}

function applyPayload(draft: DraftFields, payload: Record<string, unknown>) {
  const num = (v: unknown) =>
    v === null || v === undefined ? null : Number(v);
  const pct = (v: unknown) =>
    v === null || v === undefined ? null : Number(v) * 100;

  if (payload.purchase_details) {
    const p = payload.purchase_details as Record<string, unknown>;
    draft.downPaymentPct = pct(p.down_payment_pct);
    draft.interestRate = pct(p.interest_rate);
    draft.mortgageYears = num(p.mortgage_years);
    draft.closingCostsPct = pct(p.closing_costs_pct);
  }
  if (payload.forecasted_revenue) {
    const r = payload.forecasted_revenue as Record<string, unknown>;
    draft.coHostingFeePct = pct(r.co_hosting_fee_pct) ?? 0;
    draft.appreciationPct = pct(r.annual_re_appreciation_pct) ?? 0;
    const scenarios = r.scenarios as Record<
      string,
      { forecasted_revenue: unknown }
    >;
    draft.revenueLow = num(scenarios?.low?.forecasted_revenue);
    draft.revenueMid = num(scenarios?.mid?.forecasted_revenue);
    draft.revenueHigh = num(scenarios?.high?.forecasted_revenue);
  }
  if (payload.taxes) {
    const t = payload.taxes as Record<string, unknown>;
    draft.taxes = {
      land_assumptions_pct: pct(t.land_assumptions_pct) ?? 0,
      sla_multiplier_pct: pct(t.sla_multiplier_pct) ?? 0,
      bonus_amount_pct: pct(t.bonus_amount_pct) ?? 0,
      tax_rate_pct: pct(t.tax_rate_pct) ?? 0,
    };
  }
  if (payload.optimization_items) {
    draft.optimizationItems = (
      payload.optimization_items as {
        category: string | null;
        total_price: unknown;
      }[]
    ).map((i) => ({
      category: i.category ?? "",
      total_price: Number(i.total_price),
    }));
  }
  if (payload.operating_expenses) {
    draft.operatingExpenses = (
      payload.operating_expenses as {
        expense_name: string | null;
        monthly_amount: unknown;
      }[]
    ).map((e) => ({
      expense_name: e.expense_name ?? "",
      monthly_amount: Number(e.monthly_amount),
    }));
  }
  if (payload.tags) {
    draft.tags = payload.tags as Record<string, boolean>;
  }
  draft.updatedAt = new Date().toISOString();
}

export interface MockBackendOptions {
  activeProperty?: PropertyKey;
  initialStatus?: CaseStatus;
  seedDraft?: Partial<DraftFields>;
  attempts?: number;
  submitRating?: Rating;
}

export function createCallLog() {
  return { startUnderwritingCalls: 0, submitCalls: 0 };
}

export async function mockBackend(
  page: Page,
  {
    activeProperty = "A",
    initialStatus = "not_started",
    seedDraft,
    attempts = 0,
    submitRating = "best",
  }: MockBackendOptions = {},
) {
  const active = PROPERTIES[activeProperty];
  const idle = PROPERTIES[activeProperty === "A" ? "B" : "A"];
  const draft: DraftFields = { ...emptyDraft(active.price), ...seedDraft };
  const calls = createCallLog();
  let status: CaseStatus = initialStatus;
  let submissionId: number | null = null;
  let submission: ReturnType<typeof breakdownFor> | null = null;
  let submittedAt = "";

  function caseRow(p: PropertyFixture, caseStatus: CaseStatus) {
    const isActive = p.zpid === active.zpid;
    return {
      zpid: p.zpid,
      address: p.address,
      city: p.city,
      state: p.state,
      zipcode: p.zipcode,
      price: `$${p.price.toLocaleString("en-US")}`,
      unformatted_price: String(p.price),
      beds: p.beds,
      baths: p.baths,
      area: p.area,
      img_src: null,
      detail_url: "https://example.com/listing",
      home_type: "SINGLE_FAMILY",
      market_id: p.market.id,
      market_name: p.market.name,
      status: caseStatus,
      attempts: isActive ? attempts : 0,
      latest_accuracy: isActive ? (submission?.accuracy ?? null) : null,
      latest_rating: isActive ? (submission?.rating ?? null) : null,
      best_accuracy: isActive ? (submission?.accuracy ?? null) : null,
      best_rating: isActive ? (submission?.rating ?? null) : null,
      active_underwriting_id:
        isActive && caseStatus === "in_progress" ? p.underwritingId : null,
      latest_submission_id: isActive ? submissionId : null,
    };
  }

  function dashboardDto() {
    const properties = [caseRow(active, status), caseRow(idle, "not_started")];
    return {
      summary: {
        total_properties: properties.length,
        submitted: properties.filter((p) => p.status === "submitted").length,
        in_progress: properties.filter((p) => p.status === "in_progress")
          .length,
        not_started: properties.filter((p) => p.status === "not_started")
          .length,
        average_accuracy: submission?.accuracy ?? null,
      },
      properties,
    };
  }

  function submissionRecord() {
    return {
      id: submissionId,
      underwriting_id: active.underwritingId,
      reference_underwriting_id: null,
      zpid: active.zpid,
      rating: submission!.rating,
      accuracy: submission!.accuracy,
      breakdown: submission,
      submitted_at: submittedAt,
    };
  }

  await page.route(`${API_BASE}/api/dashboard`, (route) =>
    route.fulfill({ json: dashboardDto() }),
  );

  await page.route(`${API_BASE}/api/properties/*`, (route) => {
    const zpid = route.request().url().split("/").pop();
    const match = [active, idle].find((p) => p.zpid === zpid);
    if (!match) return route.fallback();
    route.fulfill({ json: propertyDto(match) });
  });

  await page.route(`${API_BASE}/api/markets/*`, (route) => {
    const id = Number(route.request().url().split("/").pop());
    const match = [active, idle].find((p) => p.market.id === id);
    if (!match) return route.fallback();
    route.fulfill({ json: marketDto(match) });
  });

  await page.route(`${API_BASE}/api/submissions?*`, (route) =>
    route.fulfill({ json: [] }),
  );

  await page.route(`${API_BASE}/api/submissions`, (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    route.fulfill({ json: submission ? [submissionRecord()] : [] });
  });

  await page.route(`${API_BASE}/api/submissions/*`, (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    route.fulfill({ json: submissionRecord() });
  });

  await page.route(`${API_BASE}/api/underwritings`, (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    calls.startUnderwritingCalls += 1;
    status = "in_progress";
    route.fulfill({ json: underwritingDto(active, draft, false) });
  });

  await page.route(
    `${API_BASE}/api/underwritings/${active.underwritingId}`,
    (route) => {
      const method = route.request().method();
      if (method === "GET") {
        return route.fulfill({
          json: underwritingDto(active, draft, status === "submitted"),
        });
      }
      if (method === "PUT") {
        const payload = route.request().postDataJSON();
        applyPayload(draft, payload);
        return route.fulfill({ json: underwritingDto(active, draft, false) });
      }
      return route.fallback();
    },
  );

  await page.route(
    `${API_BASE}/api/underwritings/${active.underwritingId}/submit`,
    (route) => {
      calls.submitCalls += 1;
      status = "submitted";
      submissionId = 500001;
      submittedAt = new Date().toISOString();
      submission = breakdownFor(submitRating);
      route.fulfill({
        json: {
          submission: submissionRecord(),
          underwriting: underwritingDto(active, draft, true),
          dashboard: dashboardDto(),
        },
      });
    },
  );

  return { calls, property: active };
}
