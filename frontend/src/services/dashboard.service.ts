import { streetFromAddress } from "@/lib/address";
import { toNumber } from "@/lib/number";
import { apiRequest } from "@/services/api-client";
import type {
  DashboardPropertyDto,
  DashboardResultDto,
  DashboardSummaryDto,
} from "@/types/api";
import type {
  CaseStatus,
  Dashboard,
  DashboardSummary,
  Rating,
  Score,
  TrainingCase,
} from "@/types/training";

const STATUSES: readonly CaseStatus[] = [
  "not_started",
  "in_progress",
  "submitted",
];
const RATINGS: readonly Rating[] = ["best", "medium", "low"];

function toStatus(value: string): CaseStatus {
  return STATUSES.includes(value as CaseStatus)
    ? (value as CaseStatus)
    : "not_started";
}

function toScore(accuracy: string | null, rating: string | null): Score | null {
  const value = toNumber(accuracy);
  if (value === null || !RATINGS.includes(rating as Rating)) return null;
  return { value, rating: rating as Rating };
}

function toTrainingCase(dto: DashboardPropertyDto): TrainingCase {
  return {
    zpid: dto.zpid,
    street: streetFromAddress(dto.address, `Property ${dto.zpid}`),
    city: dto.city,
    state: dto.state,
    zipcode: dto.zipcode,
    price: toNumber(dto.unformatted_price),
    beds: dto.beds,
    baths: dto.baths,
    areaSqft: dto.area,
    imageUrl: dto.img_src,
    market:
      dto.market_id !== null && dto.market_name
        ? { id: dto.market_id, name: dto.market_name }
        : null,
    status: toStatus(dto.status),
    attempts: dto.attempts,
    latestScore: toScore(dto.latest_accuracy, dto.latest_rating),
    bestScore: toScore(dto.best_accuracy, dto.best_rating),
    activeUnderwritingId: dto.active_underwriting_id,
    latestSubmissionId: dto.latest_submission_id,
  };
}

function toSummary(dto: DashboardSummaryDto): DashboardSummary {
  return {
    totalProperties: dto.total_properties,
    submitted: dto.submitted,
    inProgress: dto.in_progress,
    notStarted: dto.not_started,
    averageScore: toNumber(dto.average_accuracy),
  };
}

export function mapDashboard(dto: DashboardResultDto): Dashboard {
  return {
    summary: toSummary(dto.summary),
    cases: dto.properties.map(toTrainingCase),
  };
}

export async function getDashboard(signal?: AbortSignal): Promise<Dashboard> {
  const dto = await apiRequest<DashboardResultDto>("/api/dashboard", {
    signal,
  });
  return mapDashboard(dto);
}
