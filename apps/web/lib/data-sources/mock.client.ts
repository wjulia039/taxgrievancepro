/**
 * TaxGrievancePro — Mock Data Source Client
 * Returns realistic Long Island property & comp data for development/demo.
 * Used automatically when no API keys (RENTCAST/ATTOM/PROPAPIS) are configured.
 */

import type { DataSourceClient, DataSourceResult } from "./types";
import type { ComparableSale, PropertyData } from "~/lib/schemas/analysis.schema";

/**
 * Generates a deterministic "today minus N months" date string.
 */
function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

const MOCK_PROPERTY: PropertyData = {
  assessed_value: 450_000,
  assessment_year: 2024,
  parcel_id: "2089-22-108-00120",
  beds: 4,
  baths: 2.5,
  sqft: 2_200,
  year_built: 2001,
  county: "Nassau",
};

/**
 * 6 comps — 4 below assessed value → triggers ELIGIBLE at high confidence.
 * Addresses are realistic Long Island (Nassau County) street names.
 */
const MOCK_COMPS: ComparableSale[] = [
  {
    address: "42 Maple Ave, Levittown, NY 11756",
    sale_price: 385_000,
    sold_date: monthsAgo(2),
    beds: 3,
    baths: 2,
    sqft: 1_980,
    distance_miles: 0.3,
    similarity_score: 0.92,
    source: "mock",
  },
  {
    address: "118 Oak St, Wantagh, NY 11793",
    sale_price: 410_000,
    sold_date: monthsAgo(3),
    beds: 4,
    baths: 2,
    sqft: 2_100,
    distance_miles: 0.5,
    similarity_score: 0.88,
    source: "mock",
  },
  {
    address: "7 Birch Ln, East Meadow, NY 11554",
    sale_price: 430_000,
    sold_date: monthsAgo(1),
    beds: 4,
    baths: 2.5,
    sqft: 2_250,
    distance_miles: 0.6,
    similarity_score: 0.95,
    source: "mock",
  },
  {
    address: "305 Hempstead Tpke, Levittown, NY 11756",
    sale_price: 395_000,
    sold_date: monthsAgo(5),
    beds: 3,
    baths: 2,
    sqft: 1_850,
    distance_miles: 0.8,
    similarity_score: 0.82,
    source: "mock",
  },
  {
    address: "91 Cedar Rd, Seaford, NY 11783",
    sale_price: 475_000,
    sold_date: monthsAgo(2),
    beds: 4,
    baths: 3,
    sqft: 2_400,
    distance_miles: 0.9,
    similarity_score: 0.78,
    source: "mock",
  },
  {
    address: "22 Elm Dr, Bellmore, NY 11710",
    sale_price: 440_000,
    sold_date: monthsAgo(4),
    beds: 4,
    baths: 2.5,
    sqft: 2_150,
    distance_miles: 0.7,
    similarity_score: 0.90,
    source: "mock",
  },
];

export class MockClient implements DataSourceClient {
  async fetchPropertyAndComps(_params: {
    lat: number;
    lng: number;
    formatted_address: string;
    timeoutMs: number;
  }): Promise<DataSourceResult> {
    console.log("[data-source] MockClient: Returning demo data (no API keys configured)");

    // Simulate a small network delay so the precheck animation looks natural
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      property: { ...MOCK_PROPERTY },
      comps: MOCK_COMPS.map((c) => ({ ...c })),
      source: "mock",
    };
  }
}
