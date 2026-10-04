import { streetFromAddress } from "@/lib/address";
import { toNumber } from "@/lib/number";
import { apiRequest } from "@/services/api-client";
import type { PropertyDto } from "@/types/api";
import type { Property } from "@/types/training";

export function mapProperty(dto: PropertyDto): Property {
  return {
    zpid: dto.zpid,
    street:
      dto.address_street?.trim() ||
      streetFromAddress(dto.address, `Property ${dto.zpid}`),
    city: dto.address_city,
    state: dto.address_state,
    zipcode: dto.address_zipcode,
    price: toNumber(dto.unformatted_price),
    beds: dto.beds,
    baths: dto.baths,
    areaSqft: dto.area,
    imageUrl: dto.img_src,
    listingUrl: dto.detail_url,
    homeType: dto.home_type,
    listingStatus: dto.home_status,
    timeOnMarket: dto.time_on_zillow,
    market: dto.market ? { id: dto.market.id, name: dto.market.name } : null,
  };
}

export async function getProperty(
  zpid: string,
  signal?: AbortSignal,
): Promise<Property> {
  const dto = await apiRequest<PropertyDto>(
    `/api/properties/${encodeURIComponent(zpid)}`,
    { signal },
  );
  return mapProperty(dto);
}
