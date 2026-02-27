/**
 * TaxGrievancePro — Data Source Entry Point
 *
 * Priority chain:
 * 1. RENTCAST_API_KEY set → RentCastClient
 * 2. ATTOM_API_KEY set   → AttomClient (legacy, falls back to PropAPIS)
 * 3. No keys             → MockClient  (dev/demo mode)
 */

import { AttomClient } from "./attom.client";
import { PropApisClient } from "./propapis.client";
import { RentCastClient } from "./rentcast.client";
import { MockClient } from "./mock.client";
import type { DataSourceResult } from "./types";

type ActiveSource = "rentcast" | "attom" | "mock";

function detectActiveSource(): ActiveSource {
  if (process.env.RENTCAST_API_KEY && process.env.RENTCAST_API_KEY !== "placeholder") {
    return "rentcast";
  }
  if (process.env.ATTOM_API_KEY && process.env.ATTOM_API_KEY !== "placeholder") {
    return "attom";
  }
  return "mock";
}

export async function fetchPropertyData(params: {
  lat: number;
  lng: number;
  formatted_address: string;
  timeoutMs: number;
  // Legacy params (still accepted for backward compat but timeoutMs takes priority)
  attomTimeoutMs?: number;
  propapisTimeoutMs?: number;
}): Promise<DataSourceResult> {
  const source = detectActiveSource();
  const timeout = params.timeoutMs ?? params.attomTimeoutMs ?? 8000;

  console.log(`[data-source] Using: ${source}`);

  // ── RentCast (primary) ──────────────────────────────────────────────────
  if (source === "rentcast") {
    try {
      const client = new RentCastClient();
      return await client.fetchPropertyAndComps({
        lat: params.lat,
        lng: params.lng,
        formatted_address: params.formatted_address,
        timeoutMs: timeout,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(`[data-source] RentCast failed: ${msg}, falling back to mock`);
      // Fall through to mock on failure
    }
  }

  // ── ATTOM → PropAPIS fallback (legacy) ──────────────────────────────────
  if (source === "attom") {
    try {
      const attom = new AttomClient();
      const result = await attom.fetchPropertyAndComps({
        lat: params.lat,
        lng: params.lng,
        formatted_address: params.formatted_address,
        timeoutMs: params.attomTimeoutMs ?? timeout,
      });
      if (result.comps.length >= 3) return result;
      console.log(`[data-source] ATTOM returned only ${result.comps.length} comps, falling back to PropAPIS`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.log(`[data-source] ATTOM failed: ${msg}, falling back to PropAPIS`);
    }

    try {
      const propapis = new PropApisClient();
      return await propapis.fetchPropertyAndComps({
        lat: params.lat,
        lng: params.lng,
        formatted_address: params.formatted_address,
        timeoutMs: params.propapisTimeoutMs ?? timeout,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(`[data-source] PropAPIS also failed: ${msg}, falling back to mock`);
      // Fall through to mock
    }
  }

  // ── Mock (dev/demo or final fallback) ───────────────────────────────────
  const mock = new MockClient();
  return mock.fetchPropertyAndComps({
    lat: params.lat,
    lng: params.lng,
    formatted_address: params.formatted_address,
    timeoutMs: timeout,
  });
}

export type { DataSourceResult, DataSourceClient } from "./types";
