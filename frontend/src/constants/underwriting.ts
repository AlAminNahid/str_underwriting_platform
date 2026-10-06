import type {
  DealTagKey,
  ScenarioKey,
  UnderwritingFormValues,
  WorkspaceStep,
} from "@/types/underwriting";

export const WORKSPACE_STEPS: { id: WorkspaceStep; label: string }[] = [
  { id: "financials", label: "Financials" },
  { id: "analysis", label: "Analysis" },
  { id: "tags", label: "Deal tags" },
  { id: "review", label: "Review & submit" },
];

export const DEAL_TAGS: {
  key: DealTagKey;
  label: string;
  description: string;
}[] = [
  {
    key: "turnkey",
    label: "Turnkey",
    description: "Ready to rent without work",
  },
  {
    key: "furnished",
    label: "Furnished",
    description: "Sells with furniture included",
  },
  {
    key: "luxury",
    label: "Luxury",
    description: "High-end finish and price point",
  },
  {
    key: "tax_efficient",
    label: "Tax Efficient",
    description: "Strong depreciation benefit",
  },
  {
    key: "new_construction",
    label: "New Construction",
    description: "Recently built",
  },
  {
    key: "existing_airbnb",
    label: "Existing Airbnb",
    description: "Already operating as a rental",
  },
  { key: "arv", label: "ARV", description: "Value-add after repairs" },
  {
    key: "high_cash_on_cash",
    label: "High Cash-on-Cash",
    description: "Strong return on cash invested",
  },
  {
    key: "low_cash_on_cash",
    label: "Low Cash-on-Cash",
    description: "Weak return on cash invested",
  },
  {
    key: "add_inground_pool",
    label: "Add In-ground Pool",
    description: "Room to add a pool",
  },
  {
    key: "waterfront",
    label: "Waterfront",
    description: "On a lake, river or beach",
  },
  {
    key: "remote",
    label: "Remote",
    description: "Far from services or airports",
  },
  {
    key: "can_support_cohost",
    label: "Can Support Co-host",
    description: "Numbers work with a co-host fee",
  },
];

export const TRAINING_TAX_DEFAULTS: UnderwritingFormValues["taxes"] = {
  landPct: "20",
  shortLifeAssetPct: "25",
  bonusDepreciationPct: "60",
  taxRatePct: "37",
};

export const NEW_DRAFT_ASSUMPTIONS = {
  coHostingFeePct: "0",
  appreciationPct: "0",
} as const;

export const PRR_SANITY_RANGE = { min: 8, max: 50 } as const;

export const OPEX_MULTIPLIERS: Record<ScenarioKey, number> = {
  low: 0.96,
  mid: 1,
  high: 1.04,
};

export const OPTIMIZATION_SUGGESTIONS = [
  "Furniture & design",
  "Hot tub",
  "Game room",
  "Pool heater",
  "Outdoor kitchen",
];

export const OPEX_SUGGESTIONS = [
  "Utilities",
  "Internet",
  "Insurance",
  "Property taxes",
  "Supplies",
  "Software",
  "Maintenance reserve",
  "HOA",
];

export const AUTOSAVE_DELAY_MS = 1000;
