import type { ComparableSale, PropertyData } from "~/lib/schemas/analysis.schema";

export interface DataSourceResult {
  property: PropertyData;
  comps: ComparableSale[];
  source: "attom" | "propapis" | "rentcast" | "mock";
}

export interface DataSourceClient {
  fetchPropertyAndComps(params: { lat: number; lng: number; formatted_address: string; timeoutMs: number }): Promise<DataSourceResult>;
}
