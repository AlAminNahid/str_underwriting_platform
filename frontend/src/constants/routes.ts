export const ROUTES = {
  dashboard: "/",
  submissions: "/submissions",
  leaderboard: "/leaderboard",
  property: (zpid: string) => `/properties/${zpid}`,
  /** Temporary: the next step replaces this link with creating a draft (POST /api/underwritings). */
  newUnderwriting: (zpid: string) =>
    `/underwritings/new?zpid=${encodeURIComponent(zpid)}`,
  underwriting: (id: number) => `/underwritings/${id}`,
  submission: (id: number) => `/submissions/${id}`,
} as const;
