import { apiRequest } from "@/services/api-client";
import type { MarketDto } from "@/types/api";
import type { MarketDetails } from "@/types/training";

export function mapMarket(dto: MarketDto): MarketDetails {
  return {
    id: dto.id,
    name: dto.name,
    state: dto.state,
    region: dto.region,
    timezone: dto.timezone,
    description: dto.description,
    propertyCount: dto.property_count,
  };
}

export async function getMarket(
  id: number,
  signal?: AbortSignal,
): Promise<MarketDetails> {
  const dto = await apiRequest<MarketDto>(`/api/markets/${id}`, { signal });
  return mapMarket(dto);
}
