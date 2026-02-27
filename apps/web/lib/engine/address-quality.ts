import { GeocodeStatus } from "~/lib/shared/enums";

interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  postal_code?: string;
  country?: string;
  place_id?: string;
}

interface AddressQualityResult {
  score: number;
  geocode_status: GeocodeStatus;
}

export function scoreAddressQuality(components: AddressComponents): AddressQualityResult {
  let score = 0;
  if (components.place_id) score += 30;
  if (components.street_number) score += 20;
  if (components.route) score += 20;
  if (components.locality) score += 10;
  if (components.postal_code) score += 10;
  if (components.country) score += 5;
  if (components.street_number && components.route && components.locality && components.postal_code) {
    score += 5;
  }
  score = Math.min(100, score);

  let geocode_status: GeocodeStatus;
  if (score >= 90) geocode_status = GeocodeStatus.VERIFIED;
  else if (score >= 50) geocode_status = GeocodeStatus.PARTIAL;
  else geocode_status = GeocodeStatus.UNVERIFIED;

  return { score, geocode_status };
}
