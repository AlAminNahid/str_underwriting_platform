export type CaseStatus = "not_started" | "in_progress" | "submitted";

export type Rating = "best" | "medium" | "low";

export interface Score {
  value: number;
  rating: Rating;
}

export interface Market {
  id: number;
  name: string;
}

export interface TrainingCase {
  zpid: string;
  street: string;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  areaSqft: number | null;
  imageUrl: string | null;
  market: Market | null;
  status: CaseStatus;
  attempts: number;
  latestScore: Score | null;
  bestScore: Score | null;
  activeUnderwritingId: number | null;
  latestSubmissionId: number | null;
}

export interface DashboardSummary {
  totalProperties: number;
  submitted: number;
  inProgress: number;
  notStarted: number;
  averageScore: number | null;
}

export interface Dashboard {
  summary: DashboardSummary;
  cases: TrainingCase[];
}
