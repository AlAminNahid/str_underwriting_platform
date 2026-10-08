import type { PropertyFixture, Rating } from "./mock-api";

const SMOKIES = {
  id: 9101,
  name: "Smoky & Blue Ridge Mountains",
  slug: "smoky-blue-ridge-mountains",
  state: "TN",
};
const BROKEN_BOW = {
  id: 9102,
  name: "Broken Bow",
  slug: "broken-bow",
  state: "OK",
};
const CENTRAL_FLORIDA = {
  id: 9103,
  name: "Central Florida",
  slug: "central-florida",
  state: "FL",
};
const GULF_COAST = {
  id: 9104,
  name: "Texas Gulf Coast",
  slug: "texas-gulf-coast",
  state: "TX",
};

function seedProperty(
  index: number,
  street: string,
  city: string,
  state: string,
  zipcode: string,
  price: number,
  referenceMid: number,
  market: PropertyFixture["market"],
): PropertyFixture {
  return {
    zpid: `9100000${index}`,
    underwritingId: 910000 + index,
    price,
    referenceMid,
    address: `${street}, ${city}, ${state} ${zipcode}`,
    street,
    city,
    state,
    zipcode,
    beds: 3,
    baths: 2,
    area: 2000,
    market,
  };
}

interface BriefRow {
  property: PropertyFixture;
  best: [number, number];
  medium: [number, number];
}

export const BRIEF_REFERENCE_TABLE: BriefRow[] = [
  {
    property: seedProperty(
      1,
      "1240 Ski View Dr",
      "Gatlinburg",
      "TN",
      "37738",
      675000,
      125000,
      SMOKIES,
    ),
    best: [112500, 137500],
    medium: [93750, 156250],
  },
  {
    property: seedProperty(
      2,
      "88 Lakeshore Ln",
      "Broken Bow",
      "OK",
      "74728",
      540000,
      96000,
      BROKEN_BOW,
    ),
    best: [86400, 105600],
    medium: [72000, 120000],
  },
  {
    property: seedProperty(
      3,
      "3402 Palm Isle Ct",
      "Kissimmee",
      "FL",
      "34747",
      895000,
      165000,
      CENTRAL_FLORIDA,
    ),
    best: [148500, 181500],
    medium: [123750, 206250],
  },
  {
    property: seedProperty(
      4,
      "215 Aspen Ridge Rd",
      "Blue Ridge",
      "GA",
      "30513",
      725000,
      128000,
      SMOKIES,
    ),
    best: [115200, 140800],
    medium: [96000, 160000],
  },
  {
    property: seedProperty(
      5,
      "9 Dune Walk",
      "Port Aransas",
      "TX",
      "78373",
      1150000,
      192000,
      GULF_COAST,
    ),
    best: [172800, 211200],
    medium: [144000, 240000],
  },
  {
    property: seedProperty(
      6,
      "47 Cedar Hollow Rd",
      "Sevierville",
      "TN",
      "37876",
      449000,
      80000,
      SMOKIES,
    ),
    best: [72000, 88000],
    medium: [60000, 100000],
  },
];

export interface ScoringCase {
  property: PropertyFixture;
  mid: number;
  rating: Rating;
  score: number;
  edge: string;
}

export const SCORING_CASES: ScoringCase[] = BRIEF_REFERENCE_TABLE.flatMap(
  ({ property, best, medium }, index) => {
    const below = index % 2 === 0;
    return [
      {
        property,
        mid: below ? best[0] : best[1],
        rating: "best" as const,
        score: 100,
        edge: below ? "lowest Best value" : "highest Best value",
      },
      {
        property,
        mid: below ? medium[0] : medium[1],
        rating: "medium" as const,
        score: 70,
        edge: below ? "lowest Medium value" : "highest Medium value",
      },
      {
        property,
        mid: below ? medium[0] - 1 : medium[1] + 1,
        rating: "low" as const,
        score: 40,
        edge: below ? "$1 below the Medium range" : "$1 above the Medium range",
      },
    ];
  },
);
