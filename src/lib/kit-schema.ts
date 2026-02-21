export type KitStepId =
  | "property"
  | "assessment"
  | "comparables"
  | "exemptions"
  | "payment"
  | "complete";

export type KitComparable = {
  address: string;
  saleDate: string; // YYYY-MM-DD
  salePrice: number;
  sqft: number;
  beds?: number;
  baths?: number;
  distanceMiles?: number;
};

export type KitState = {
  step: KitStepId;

  // Property
  sellSoon: "no" | "yes";
  ownerName: string;
  address1: string;
  address2: string;
  city: string;
  state: "NY";
  zip: string;

  sqft: number | "";
  yearBuilt: number | "";
  beds: number | "";
  baths: number | "";

  assessedValue: number | "";

  // Assessment notice
  taxYear: string;
  noticeDate: string; // YYYY-MM-DD

  // Comps
  comps: KitComparable[];

  // Exemptions (placeholder for Suffolk v1)
  exemptions: {
    homestead: boolean;
    senior: boolean;
    veteran: boolean;
    disability: boolean;
    other: boolean;
  };
};

export const DEFAULT_KIT_STATE: KitState = {
  step: "property",

  sellSoon: "no",
  ownerName: "",
  address1: "",
  address2: "",
  city: "",
  state: "NY",
  zip: "",

  sqft: "",
  yearBuilt: "",
  beds: "",
  baths: "",

  assessedValue: "",

  taxYear: String(new Date().getFullYear()),
  noticeDate: "",

  comps: [],

  exemptions: {
    homestead: false,
    senior: false,
    veteran: false,
    disability: false,
    other: false,
  },
};

export function calcPricePerSqft(assessedValue: number | "", sqft: number | "") {
  if (!assessedValue || !sqft) return null;
  if (typeof assessedValue !== "number" || typeof sqft !== "number") return null;
  if (sqft <= 0) return null;
  return assessedValue / sqft;
}
