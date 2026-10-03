import { HistoryIcon, LayoutDashboardIcon, TrophyIcon, type LucideIcon } from "lucide-react";

import { ROUTES } from "@/constants/routes";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboardIcon },
  { label: "Submissions", href: ROUTES.submissions, icon: HistoryIcon },
  { label: "Leaderboard", href: ROUTES.leaderboard, icon: TrophyIcon },
];

/** Static trainee profile: the API has no users or authentication. */
export const CURRENT_TRAINEE = {
  name: "Al-Amin Hossain Nahid",
  initials: "AN",
} as const;
