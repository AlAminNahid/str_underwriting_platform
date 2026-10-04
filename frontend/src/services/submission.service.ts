import { toNumber } from "@/lib/number";
import { toScore } from "@/lib/score";
import { apiRequest } from "@/services/api-client";
import type { SubmissionDto } from "@/types/api";
import type { Attempt } from "@/types/training";

export function mapAttempt(dto: SubmissionDto): Attempt | null {
  const score = toScore(dto.accuracy, dto.rating);
  if (!score) return null;
  return {
    id: dto.id,
    underwritingId: dto.underwriting_id,
    submittedAt: new Date(dto.submitted_at),
    score,
    midForecast: toNumber(dto.breakdown?.candidate),
    referenceMid: toNumber(dto.breakdown?.reference),
    deviation: toNumber(dto.breakdown?.deviation) ?? 0,
  };
}

export async function getAttemptsForProperty(
  zpid: string,
  signal?: AbortSignal,
): Promise<Attempt[]> {
  const params = new URLSearchParams({ zpid });
  const dtos = await apiRequest<SubmissionDto[]>(`/api/submissions?${params}`, {
    signal,
  });
  return dtos.map(mapAttempt).filter((a): a is Attempt => a !== null);
}
