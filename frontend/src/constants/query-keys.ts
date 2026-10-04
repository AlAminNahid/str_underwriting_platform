export const queryKeys = {
  dashboard: ["dashboard"] as const,
  property: (zpid: string) => ["property", zpid] as const,
  market: (id: number) => ["market", id] as const,
  propertyAttempts: (zpid: string) => ["submissions", { zpid }] as const,
  underwriting: (id: number) => ["underwriting", id] as const,
  allSubmissions: ["submissions"] as const,
  submission: (id: number) => ["submission", id] as const,
};
