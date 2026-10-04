import { apiRequest } from "@/services/api-client";
import type {
  SaveUnderwritingPayloadDto,
  SubmitUnderwritingResultDto,
  UnderwritingDto,
} from "@/types/api";

export function startUnderwriting(zpid: string): Promise<UnderwritingDto> {
  return apiRequest<UnderwritingDto>("/api/underwritings", {
    method: "POST",
    body: { zpid },
  });
}

export function getUnderwriting(
  id: number,
  signal?: AbortSignal,
): Promise<UnderwritingDto> {
  return apiRequest<UnderwritingDto>(`/api/underwritings/${id}`, { signal });
}

export function saveUnderwriting(
  id: number,
  payload: SaveUnderwritingPayloadDto,
): Promise<UnderwritingDto> {
  return apiRequest<UnderwritingDto>(`/api/underwritings/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function submitUnderwriting(
  id: number,
  payload: SaveUnderwritingPayloadDto,
): Promise<SubmitUnderwritingResultDto> {
  return apiRequest<SubmitUnderwritingResultDto>(
    `/api/underwritings/${id}/submit`,
    {
      method: "POST",
      body: payload,
    },
  );
}
