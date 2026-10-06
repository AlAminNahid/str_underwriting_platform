export const ROUTES = {
  dashboard: "/",
  submissions: "/submissions",
  property: (zpid: string) => `/properties/${zpid}`,
  underwriting: (id: number) => `/underwritings/${id}`,
  submission: (id: number) => `/submissions/${id}`,
} as const;
