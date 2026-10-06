export type DecimalNumber = number;
export type DecimalInput = string;

export interface DashboardSummaryDto {
  total_properties: number;
  submitted: number;
  in_progress: number;
  not_started: number;
  average_accuracy: DecimalNumber | null;
}

export interface DashboardPropertyDto {
  zpid: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  price: string | null;
  unformatted_price: string | null;
  beds: number | null;
  baths: number | null;
  area: number | null;
  img_src: string | null;
  detail_url: string | null;
  home_type: string | null;
  market_id: number | null;
  market_name: string | null;
  status: string;
  attempts: number;
  latest_accuracy: DecimalNumber | null;
  latest_rating: string | null;
  best_accuracy: DecimalNumber | null;
  best_rating: string | null;
  active_underwriting_id: number | null;
  latest_submission_id: number | null;
}

export interface DashboardResultDto {
  summary: DashboardSummaryDto;
  properties: DashboardPropertyDto[];
}

export interface MarketSummaryDto {
  id: number;
  name: string;
  slug: string;
  state: string | null;
}

export interface PropertyDto {
  zpid: string;
  img_src: string | null;
  detail_url: string | null;
  price: string | null;
  unformatted_price: string | null;
  address: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zipcode: string | null;
  beds: number | null;
  baths: number | null;
  area: number | null;
  latitude: number | null;
  longitude: number | null;
  home_type: string | null;
  home_status: string | null;
  time_on_zillow: string | null;
  flex_text: string | null;
  market_id: number | null;
  market: MarketSummaryDto | null;
  created_at: string | null;
}

export interface MarketDto {
  id: number;
  name: string;
  slug: string;
  state: string | null;
  region: string | null;
  country: string;
  timezone: string | null;
  description: string | null;
  is_active: boolean;
  property_count: number;
  created_at: string | null;
}

export interface ScoreResultDto {
  rating: string;
  accuracy: DecimalNumber;
  metric: string;
  label: string;
  candidate: DecimalNumber | null;
  reference: DecimalNumber | null;
  deviation: DecimalNumber;
  best_threshold: DecimalNumber;
  medium_threshold: DecimalNumber;
}

export interface SubmissionDto {
  id: number;
  underwriting_id: number;
  reference_underwriting_id: number | null;
  zpid: string;
  rating: string;
  accuracy: DecimalNumber;
  breakdown: ScoreResultDto;
  submitted_at: string;
}

export interface ApiErrorBodyDto {
  detail?: string | { msg: string; loc?: (string | number)[] }[];
}

export interface OptimizationItemDto {
  id: number;
  category: string | null;
  total_price: DecimalNumber | null;
}

export interface OperatingExpenseDto {
  id: number;
  expense_name: string | null;
  monthly_amount: DecimalNumber | null;
}

export interface UnderwritingTaxDto {
  land_assumptions_pct: DecimalNumber | null;
  sla_multiplier_pct: DecimalNumber | null;
  bonus_amount_pct: DecimalNumber | null;
  tax_rate_pct: DecimalNumber | null;
  improvement_basis: DecimalNumber | null;
  estimated_short_life_assets: DecimalNumber | null;
  y1_loss_from_depreciation: DecimalNumber | null;
  tax_savings: DecimalNumber | null;
}

export interface UnderwritingDetailDto {
  purchase_details: Record<string, unknown> | null;
  forecasted_revenue: Record<string, unknown> | null;
  y1_coc_incl_tax_savings: Record<string, unknown> | null;
  zillow_property: Record<string, unknown> | null;
  analyst_notes: string | null;
}

export type DealTagsDto = {
  turnkey: boolean | null;
  furnished: boolean | null;
  luxury: boolean | null;
  tax_efficient: boolean | null;
  new_construction: boolean | null;
  existing_airbnb: boolean | null;
  arv: boolean | null;
  high_cash_on_cash: boolean | null;
  low_cash_on_cash: boolean | null;
  add_inground_pool: boolean | null;
  waterfront: boolean | null;
  remote: boolean | null;
  can_support_cohost: boolean | null;
};

export interface UnderwritingDto extends DealTagsDto {
  id: number;
  zpid: string | null;
  market_id: number | null;
  is_reference: boolean;
  deal_status: string | null;
  deal_submitted: string | null;
  property_address: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  purchase_price: DecimalNumber | null;
  total_oop: DecimalNumber | null;
  mid_gross_revenue: DecimalNumber | null;
  prr: DecimalNumber | null;
  l_cash_on_cash: DecimalNumber | null;
  m_cash_on_cash: DecimalNumber | null;
  h_cash_on_cash: DecimalNumber | null;
  created_at: string | null;
  updated_at: string | null;
  detail: UnderwritingDetailDto | null;
  taxes: UnderwritingTaxDto | null;
  optimization_items: OptimizationItemDto[];
  operating_expenses: OperatingExpenseDto[];
}

export interface SaveUnderwritingPayloadDto {
  purchase_details?: {
    purchase_price: DecimalInput;
    down_payment_pct: DecimalInput;
    interest_rate: DecimalInput;
    mortgage_years: number;
    closing_costs_pct: DecimalInput;
  };
  forecasted_revenue?: {
    co_hosting_fee_pct: DecimalInput;
    annual_re_appreciation_pct: DecimalInput;
    scenarios: Record<
      "low" | "mid" | "high",
      { forecasted_revenue: DecimalInput }
    >;
  };
  taxes?: {
    land_assumptions_pct: DecimalInput;
    sla_multiplier_pct: DecimalInput;
    bonus_amount_pct: DecimalInput;
    tax_rate_pct: DecimalInput;
  };
  optimization_items?: {
    category: string | null;
    total_price: DecimalInput | null;
  }[];
  operating_expenses?: {
    expense_name: string | null;
    monthly_amount: DecimalInput | null;
  }[];
  tags?: { [K in keyof DealTagsDto]: boolean };
}

export interface SubmitUnderwritingResultDto {
  submission: SubmissionDto;
  underwriting: UnderwritingDto;
  dashboard: DashboardResultDto;
}
