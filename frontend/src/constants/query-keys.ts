export const queryKeys = {
  dashboard: ["dashboard"] as const,
  property: (zpid: string) => ["property", zpid] as const,
  market: (id: number) => ["market", id] as const,
  propertyAttempts: (zpid: string) => ["submissions", { zpid }] as const,
};
