export type DecimalString = string;

export interface DashboardSummaryDto {
  total_properties: number;
  submitted: number;
  in_progress: number;
  not_started: number;
  average_accuracy: DecimalString | null;
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
  latest_accuracy: DecimalString | null;
  latest_rating: string | null;
  best_accuracy: DecimalString | null;
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
  accuracy: DecimalString;
  metric: string;
  label: string;
  candidate: DecimalString | null;
  reference: DecimalString | null;
  deviation: DecimalString;
  best_threshold: DecimalString;
  medium_threshold: DecimalString;
}

export interface SubmissionDto {
  id: number;
  underwriting_id: number;
  reference_underwriting_id: number | null;
  zpid: string;
  rating: string;
  accuracy: DecimalString;
  breakdown: ScoreResultDto;
  submitted_at: string;
}

export interface ApiErrorBodyDto {
  detail?: string | { msg: string; loc?: (string | number)[] }[];
}
