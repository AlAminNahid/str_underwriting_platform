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

export interface ApiErrorBodyDto {
  detail?: string | { msg: string; loc?: (string | number)[] }[];
}
