export function streetFromAddress(
  address: string | null,
  fallback: string,
): string {
  const street = address?.split(",")[0]?.trim();
  return street || fallback;
}
