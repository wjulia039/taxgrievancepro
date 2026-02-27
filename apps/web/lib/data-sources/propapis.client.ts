import type { DataSourceClient, DataSourceResult } from "./types";
import type { ComparableSale, PropertyData } from "~/lib/schemas/analysis.schema";

export class PropApisClient implements DataSourceClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.PROPAPIS_API_KEY ?? "";
    this.baseUrl = process.env.PROPAPIS_BASE_URL ?? "https://api.propapis.com/v1";
    if (!this.apiKey) throw new Error("PROPAPIS_API_KEY environment variable is required");
  }

  async fetchPropertyAndComps(params: { lat: number; lng: number; formatted_address: string; timeoutMs: number }): Promise<DataSourceResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), params.timeoutMs);
    try {
      const url = new URL(`${this.baseUrl}/property/comps`);
      url.searchParams.set("address", params.formatted_address);
      url.searchParams.set("lat", params.lat.toString());
      url.searchParams.set("lng", params.lng.toString());
      url.searchParams.set("radius_miles", "1");
      url.searchParams.set("limit", "20");
      const response = await fetch(url.toString(), { headers: { Accept: "application/json", Authorization: `Bearer ${this.apiKey}` }, signal: controller.signal });
      if (!response.ok) throw new Error(`PropAPIS error: ${response.status}`);
      const data = await response.json();
      return { property: this.mapProperty(data), comps: this.mapComps(data), source: "propapis" };
    } finally {
      clearTimeout(timeout);
    }
  }

  private mapProperty(data: Record<string, unknown>): PropertyData {
    const prop = (data as any)?.subject_property ?? {};
    return {
      assessed_value: prop?.assessed_value ?? undefined,
      assessment_year: prop?.assessment_year ?? undefined,
      parcel_id: prop?.parcel_id ?? undefined,
      beds: prop?.bedrooms ?? undefined,
      baths: prop?.bathrooms ?? undefined,
      sqft: prop?.living_area_sqft ?? undefined,
      year_built: prop?.year_built ?? undefined,
      county: this.detectCounty(prop?.county),
    };
  }

  private mapComps(data: Record<string, unknown>): ComparableSale[] {
    const comps = (data as any)?.comparable_sales ?? [];
    return comps.map((comp: any) => ({
      address: comp?.address ?? "Unknown",
      sale_price: comp?.sale_price ?? 0,
      sold_date: comp?.sale_date ?? new Date().toISOString().slice(0, 10),
      beds: comp?.bedrooms ?? undefined,
      baths: comp?.bathrooms ?? undefined,
      sqft: comp?.living_area_sqft ?? undefined,
      distance_miles: comp?.distance_miles ?? undefined,
      similarity_score: comp?.similarity_score ?? undefined,
      source: "propapis" as const,
    }));
  }

  private detectCounty(countyName: string | undefined): "Suffolk" | "Nassau" | "Unknown" {
    if (!countyName) return "Unknown";
    const lower = countyName.toLowerCase();
    if (lower.includes("suffolk")) return "Suffolk";
    if (lower.includes("nassau")) return "Nassau";
    return "Unknown";
  }
}
