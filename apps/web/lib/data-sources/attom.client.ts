import type { DataSourceClient, DataSourceResult } from "./types";
import type { ComparableSale, PropertyData } from "~/lib/schemas/analysis.schema";

export class AttomClient implements DataSourceClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ATTOM_API_KEY ?? "";
    this.baseUrl = process.env.ATTOM_BASE_URL ?? "https://api.gateway.attomdata.com";
    if (!this.apiKey) throw new Error("ATTOM_API_KEY environment variable is required");
  }

  async fetchPropertyAndComps(params: { lat: number; lng: number; formatted_address: string; timeoutMs: number }): Promise<DataSourceResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), params.timeoutMs);
    try {
      const property = await this.fetchProperty(params.formatted_address, controller.signal);
      const comps = await this.fetchComps(params.lat, params.lng, controller.signal);
      return { property, comps, source: "attom" };
    } finally {
      clearTimeout(timeout);
    }
  }

  private async fetchProperty(address: string, signal: AbortSignal): Promise<PropertyData> {
    const url = new URL(`${this.baseUrl}/propertyapi/v1.0.0/property/basicprofile`);
    url.searchParams.set("address", address);
    const response = await fetch(url.toString(), { headers: { Accept: "application/json", apikey: this.apiKey }, signal });
    if (!response.ok) throw new Error(`ATTOM property API error: ${response.status}`);
    const data = await response.json();
    const property = (data as any)?.property?.[0] ?? {};
    const building = property?.building ?? {};
    const assessment = property?.assessment ?? {};
    return {
      assessed_value: assessment?.assessed?.assdTtlValue ?? undefined,
      assessment_year: assessment?.assessed?.assdYear ?? undefined,
      parcel_id: property?.identifier?.apn ?? undefined,
      beds: building?.rooms?.beds ?? undefined,
      baths: building?.rooms?.bathsFull ?? undefined,
      sqft: building?.size?.livingSize ?? undefined,
      year_built: building?.summary?.yearBuilt ?? undefined,
      county: this.detectCounty(property?.area?.countrySecSubd),
    };
  }

  private async fetchComps(lat: number, lng: number, signal: AbortSignal): Promise<ComparableSale[]> {
    const url = new URL(`${this.baseUrl}/propertyapi/v1.0.0/sale/snapshot`);
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("radius", "1");
    url.searchParams.set("orderBy", "distance");
    url.searchParams.set("pageSize", "20");
    const response = await fetch(url.toString(), { headers: { Accept: "application/json", apikey: this.apiKey }, signal });
    if (!response.ok) throw new Error(`ATTOM comps API error: ${response.status}`);
    const data = await response.json();
    const sales = (data as any)?.property ?? [];
    return sales.map((sale: any) => ({
      address: sale?.address?.oneLine ?? "Unknown",
      sale_price: sale?.sale?.amount?.saleAmt ?? 0,
      sold_date: sale?.sale?.amount?.saleRecDate ?? new Date().toISOString().slice(0, 10),
      beds: sale?.building?.rooms?.beds ?? undefined,
      baths: sale?.building?.rooms?.bathsFull ?? undefined,
      sqft: sale?.building?.size?.livingSize ?? undefined,
      distance_miles: sale?.location?.distance ?? undefined,
      similarity_score: undefined,
      source: "attom" as const,
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
