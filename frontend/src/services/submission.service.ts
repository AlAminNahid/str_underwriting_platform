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
    zpid: dto.zpid,
    submittedAt: new Date(dto.submitted_at),
    score,
    midForecast: toNumber(dto.breakdown?.candidate),
    referenceMid: toNumber(dto.breakdown?.reference),
    deviation: toNumber(dto.breakdown?.deviation) ?? 0,
    bestThreshold: toNumber(dto.breakdown?.best_threshold) ?? 0.1,
    mediumThreshold: toNumber(dto.breakdown?.medium_threshold) ?? 0.25,
  };
}

function mapList(dtos: SubmissionDto[]): Attempt[] {
  return dtos.map(mapAttempt).filter((a): a is Attempt => a !== null);
}

export async function getAttemptsForProperty(
  zpid: string,
  signal?: AbortSignal,
): Promise<Attempt[]> {
  const params = new URLSearchParams({ zpid });
  return mapList(
    await apiRequest<SubmissionDto[]>(`/api/submissions?${params}`, { signal }),
  );
}

export async function getAllAttempts(signal?: AbortSignal): Promise<Attempt[]> {
  return mapList(
    await apiRequest<SubmissionDto[]>("/api/submissions", { signal }),
  );
}

export async function getSubmission(
  id: number,
  signal?: AbortSignal,
): Promise<Attempt> {
  const attempt = mapAttempt(
    await apiRequest<SubmissionDto>(`/api/submissions/${id}`, { signal }),
  );
  if (!attempt) throw new Error("The submission has no valid score.");
  return attempt;
}
