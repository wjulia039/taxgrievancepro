/**
 * TaxGrievancePro — RentCast API Data Source Client
 * Single-API replacement for ATTOM + PropAPIS.
 *
 * Endpoints used:
 *   GET /v1/properties       — Property details + tax assessment
 *   GET /v1/comparables      — Comparable recent sales
 *
 * Env: RENTCAST_API_KEY (required to use this client)
 * Docs: https://developers.rentcast.io/reference
 */

import type { DataSourceClient, DataSourceResult } from "./types";
import type { ComparableSale, PropertyData } from "~/lib/schemas/analysis.schema";

const RENTCAST_BASE_URL = "https://api.rentcast.io/v1";

export class RentCastClient implements DataSourceClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.RENTCAST_API_KEY ?? "";
    if (!this.apiKey) {
      throw new Error("RENTCAST_API_KEY environment variable is required");
    }
  }

  async fetchPropertyAndComps(params: {
    lat: number;
    lng: number;
    formatted_address: string;
    timeoutMs: number;
  }): Promise<DataSourceResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), params.timeoutMs);

    try {
      // Fetch property details and comparables in parallel
      const [property, comps] = await Promise.all([
        this.fetchProperty(params.formatted_address, controller.signal),
        this.fetchComps(params.lat, params.lng, controller.signal),
      ]);

      return { property, comps, source: "rentcast" };
    } finally {
      clearTimeout(timeout);
    }
  }

  // ── Property Details ─────────────────────────────────────────────────────

  private async fetchProperty(
    address: string,
    signal: AbortSignal
  ): Promise<PropertyData> {
    const url = new URL(`${RENTCAST_BASE_URL}/properties`);
    url.searchParams.set("address", address);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "X-Api-Key": this.apiKey,
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`RentCast properties API error: ${response.status}`);
    }

    const data = await response.json();

    // RentCast returns an array; the first result is the subject property
    const prop = Array.isArray(data) ? data[0] : data;
    if (!prop) {
      console.warn("[rentcast] No property found for address:", address);
      return {};
    }

    return {
      assessed_value: prop.assessedValue ?? prop.taxAssessment ?? undefined,
      assessment_year: prop.assessmentYear ?? undefined,
      parcel_id: prop.id ?? prop.parcelId ?? undefined,
      beds: prop.bedrooms ?? undefined,
      baths: prop.bathrooms ?? undefined,
      sqft: prop.squareFootage ?? undefined,
      year_built: prop.yearBuilt ?? undefined,
      county: this.detectCounty(prop.county),
    };
  }

  // ── Comparable Sales ─────────────────────────────────────────────────────

  private async fetchComps(
    lat: number,
    lng: number,
    signal: AbortSignal
  ): Promise<ComparableSale[]> {
    const url = new URL(`${RENTCAST_BASE_URL}/comparables`);
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("radius", "1"); // 1 mile
    url.searchParams.set("limit", "20");
    url.searchParams.set("status", "Sold");
    // Only recent sales (last 12 months)
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    url.searchParams.set("daysOld", "365");

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "X-Api-Key": this.apiKey,
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`RentCast comparables API error: ${response.status}`);
    }

    const data = await response.json();
    const sales: unknown[] = Array.isArray(data) ? data : data?.comparables ?? [];

    return sales.map((sale: any) => ({
      address: sale.formattedAddress ?? sale.addressLine1 ?? "Unknown",
      sale_price: sale.lastSalePrice ?? sale.price ?? 0,
      sold_date:
        sale.lastSaleDate ??
        sale.listedDate ??
        new Date().toISOString().slice(0, 10),
      beds: sale.bedrooms ?? undefined,
      baths: sale.bathrooms ?? undefined,
      sqft: sale.squareFootage ?? undefined,
      distance_miles: sale.distance ?? undefined,
      similarity_score: sale.correlation ?? undefined,
      source: "rentcast" as const,
    }));
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private detectCounty(
    countyName: string | undefined
  ): "Suffolk" | "Nassau" | "Unknown" {
    if (!countyName) return "Unknown";
    const lower = countyName.toLowerCase();
    if (lower.includes("suffolk")) return "Suffolk";
    if (lower.includes("nassau")) return "Nassau";
    return "Unknown";
  }
}
