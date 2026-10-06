import {
  DEAL_TAGS,
  NEW_DRAFT_ASSUMPTIONS,
  TRAINING_TAX_DEFAULTS,
} from "@/constants/underwriting";
import { streetFromAddress } from "@/lib/address";
import { toNumber } from "@/lib/number";
import {
  assumptionsSchema,
  purchaseSchema,
  revenueSchema,
  taxesSchema,
} from "@/lib/underwriting/schema";
import type { SaveUnderwritingPayloadDto, UnderwritingDto } from "@/types/api";
import type {
  DealTagKey,
  LineItemValues,
  UnderwritingDraft,
  UnderwritingFormValues,
} from "@/types/underwriting";

function decimalToInput(value: unknown): string {
  const n = toNumber(value as string | number | null | undefined);
  return n === null ? "" : String(n);
}

function fractionToPercentInput(value: unknown): string {
  const n = toNumber(value as string | number | null | undefined);
  return n === null ? "" : String(Number((n * 100).toFixed(6)));
}

function fractionToPercent(value: number | null): number | null {
  const n = toNumber(value);
  return n === null ? null : n * 100;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function emptyTags(): Record<DealTagKey, boolean> {
  return Object.fromEntries(DEAL_TAGS.map((t) => [t.key, false])) as Record<
    DealTagKey,
    boolean
  >;
}

export function mapUnderwriting(dto: UnderwritingDto): UnderwritingDraft {
  const purchase = record(dto.detail?.purchase_details);
  const forecast = record(dto.detail?.forecasted_revenue);
  const scenarios = record(forecast.scenarios);
  const listing = record(dto.detail?.zillow_property);
  const revenueOf = (key: string) =>
    decimalToInput(record(scenarios[key]).forecasted_revenue);

  const tags = emptyTags();
  for (const { key } of DEAL_TAGS) tags[key] = dto[key] === true;

  const savedValues: UnderwritingFormValues = {
    purchase: {
      price: decimalToInput(purchase.purchase_price ?? dto.purchase_price),
      downPaymentPct: fractionToPercentInput(purchase.down_payment_pct),
      interestRatePct: fractionToPercentInput(purchase.interest_rate),
      termYears: decimalToInput(purchase.mortgage_years),
      closingCostsPct: fractionToPercentInput(purchase.closing_costs_pct),
    },
    optimizationItems: dto.optimization_items.map((row) => ({
      label: row.category ?? "",
      amount: decimalToInput(row.total_price),
    })),
    operatingExpenses: dto.operating_expenses.map((row) => ({
      label: row.expense_name ?? "",
      amount: decimalToInput(row.monthly_amount),
    })),
    taxes: {
      landPct: fractionToPercentInput(dto.taxes?.land_assumptions_pct),
      shortLifeAssetPct: fractionToPercentInput(dto.taxes?.sla_multiplier_pct),
      bonusDepreciationPct: fractionToPercentInput(dto.taxes?.bonus_amount_pct),
      taxRatePct: fractionToPercentInput(dto.taxes?.tax_rate_pct),
    },
    revenue: {
      low: revenueOf("low"),
      mid: revenueOf("mid"),
      high: revenueOf("high"),
    },
    coHostingFeePct: fractionToPercentInput(forecast.co_hosting_fee_pct),
    appreciationPct: fractionToPercentInput(
      forecast.annual_re_appreciation_pct,
    ),
    tags,
  };

  const address =
    dto.property_address ?? (listing.address as string | undefined) ?? null;
  return {
    id: dto.id,
    zpid: dto.zpid,
    street:
      dto.street?.trim() ||
      streetFromAddress(address, `Underwriting ${dto.id}`),
    city: dto.city,
    state: dto.state,
    marketId: dto.market_id,
    listPrice: toNumber(dto.purchase_price),
    isReference: dto.is_reference,
    isSubmitted:
      dto.deal_status === "analyst_completed" || dto.deal_submitted !== null,
    updatedAt: dto.updated_at,
    savedValues,
    values: withNewDraftDefaults(savedValues),
    official: {
      totalOutOfPocket: toNumber(dto.total_oop),
      midRevenue: toNumber(dto.mid_gross_revenue),
      prr: fractionToPercent(dto.prr),
      cashOnCash: {
        low: fractionToPercent(dto.l_cash_on_cash),
        mid: fractionToPercent(dto.m_cash_on_cash),
        high: fractionToPercent(dto.h_cash_on_cash),
      },
    },
  };
}

const isBlank = (values: Record<string, string>) =>
  Object.values(values).every((v) => !v.trim());

export function withNewDraftDefaults(
  values: UnderwritingFormValues,
): UnderwritingFormValues {
  return {
    ...values,
    taxes: isBlank(values.taxes) ? { ...TRAINING_TAX_DEFAULTS } : values.taxes,
    coHostingFeePct: values.coHostingFeePct.trim()
      ? values.coHostingFeePct
      : NEW_DRAFT_ASSUMPTIONS.coHostingFeePct,
    appreciationPct: values.appreciationPct.trim()
      ? values.appreciationPct
      : NEW_DRAFT_ASSUMPTIONS.appreciationPct,
  };
}

function percentToFraction(value: string): string {
  return String(Number((Number(value) / 100).toFixed(8)));
}

function optionalPercentToFraction(value: string): string {
  return value.trim() ? percentToFraction(value) : "0";
}

function amountOrNull(value: string): string | null {
  const n = Number(value.trim());
  return value.trim() && Number.isFinite(n) && n >= 0 ? String(n) : null;
}

function lineItems(rows: LineItemValues[]) {
  return rows
    .filter((row) => row.label.trim() || row.amount.trim())
    .map((row) => ({
      label: row.label.trim() || null,
      amount: amountOrNull(row.amount),
    }));
}

export function toSavePayload(
  values: UnderwritingFormValues,
): SaveUnderwritingPayloadDto {
  const payload: SaveUnderwritingPayloadDto = {
    optimization_items: lineItems(values.optimizationItems).map((r) => ({
      category: r.label,
      total_price: r.amount,
    })),
    operating_expenses: lineItems(values.operatingExpenses).map((r) => ({
      expense_name: r.label,
      monthly_amount: r.amount,
    })),
    tags: { ...values.tags },
  };

  if (purchaseSchema.safeParse(values.purchase).success) {
    const p = values.purchase;
    payload.purchase_details = {
      purchase_price: String(Number(p.price)),
      down_payment_pct: percentToFraction(p.downPaymentPct),
      interest_rate: percentToFraction(p.interestRatePct),
      mortgage_years: Number(p.termYears),
      closing_costs_pct: percentToFraction(p.closingCostsPct),
    };
  }

  if (taxesSchema.safeParse(values.taxes).success) {
    const t = values.taxes;
    payload.taxes = {
      land_assumptions_pct: percentToFraction(t.landPct),
      sla_multiplier_pct: percentToFraction(t.shortLifeAssetPct),
      bonus_amount_pct: percentToFraction(t.bonusDepreciationPct),
      tax_rate_pct: percentToFraction(t.taxRatePct),
    };
  }

  const assumptions = {
    coHostingFeePct: values.coHostingFeePct,
    appreciationPct: values.appreciationPct,
  };
  if (
    revenueSchema.safeParse(values.revenue).success &&
    assumptionsSchema.safeParse(assumptions).success
  ) {
    const r = values.revenue;
    payload.forecasted_revenue = {
      co_hosting_fee_pct: optionalPercentToFraction(values.coHostingFeePct),
      annual_re_appreciation_pct: optionalPercentToFraction(
        values.appreciationPct,
      ),
      scenarios: {
        low: { forecasted_revenue: String(Number(r.low)) },
        mid: { forecasted_revenue: String(Number(r.mid)) },
        high: { forecasted_revenue: String(Number(r.high)) },
      },
    };
  }

  return payload;
}
