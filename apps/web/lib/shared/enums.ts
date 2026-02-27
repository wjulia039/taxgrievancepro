/**
 * TaxGrievancePro — Shared Enums
 * SINGLE SOURCE OF TRUTH for all statuses and enums.
 * No duplicates anywhere else in the codebase.
 */

// ─── Precheck ───────────────────────────────────────────────

export enum PrecheckStatus {
  PENDING = "PENDING",
  ELIGIBLE = "ELIGIBLE",
  NOT_ELIGIBLE = "NOT_ELIGIBLE",
}

export enum PrecheckResponseSource {
  LIVE = "LIVE",
  CACHE = "CACHE",
}

// ─── Order ──────────────────────────────────────────────────

export enum OrderStatus {
  CREATED = "CREATED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
}

export const ORDER_ACTIVE_STATUSES = [
  OrderStatus.CREATED,
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.COMPLETED,
] as const;

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELED],
  [OrderStatus.PAYMENT_PENDING]: [OrderStatus.PAID, OrderStatus.CANCELED],
  [OrderStatus.PAID]: [OrderStatus.PROCESSING],
  [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.FAILED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.FAILED]: [OrderStatus.PROCESSING],
  [OrderStatus.CANCELED]: [],
};

// ─── Report ─────────────────────────────────────────────────

export enum ReportStatus {
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export const REPORT_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  [ReportStatus.QUEUED]: [ReportStatus.PROCESSING],
  [ReportStatus.PROCESSING]: [ReportStatus.COMPLETED, ReportStatus.FAILED],
  [ReportStatus.COMPLETED]: [],
  [ReportStatus.FAILED]: [],
};

// ─── Eligibility ────────────────────────────────────────────

export enum EligibilityDecision {
  ELIGIBLE = "ELIGIBLE",
  NOT_ELIGIBLE = "NOT_ELIGIBLE",
}

export enum EligibilityFactor {
  COMPS_FOUND = "COMPS_FOUND",
  COMPS_LOWER_THAN_ASSESSED = "COMPS_LOWER_THAN_ASSESSED",
  LOWER_COMP_RATIO_HIGH = "LOWER_COMP_RATIO_HIGH",
  ADDRESS_QUALITY_LOW = "ADDRESS_QUALITY_LOW",
  PROPERTY_DATA_CONFLICT = "PROPERTY_DATA_CONFLICT",
  INSUFFICIENT_COMPS = "INSUFFICIENT_COMPS",
  OUTLIER_FILTERED = "OUTLIER_FILTERED",
}

// ─── Geocode ────────────────────────────────────────────────

export enum GeocodeStatus {
  UNVERIFIED = "UNVERIFIED",
  PARTIAL = "PARTIAL",
  VERIFIED = "VERIFIED",
}

// ─── Data Source ─────────────────────────────────────────────

export enum DataSource {
  ATTOM = "attom",
  PROPAPIS = "propapis",
  USER_INPUT = "user_input",
}

// ─── Audit Events ───────────────────────────────────────────

export enum AuditEventType {
  PRECHECK_CREATED = "PRECHECK_CREATED",
  ORDER_CREATED = "ORDER_CREATED",
  PAYMENT_SUCCEEDED = "PAYMENT_SUCCEEDED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  REPORT_GENERATION_STARTED = "REPORT_GENERATION_STARTED",
  REPORT_GENERATION_FAILED = "REPORT_GENERATION_FAILED",
  REPORT_GENERATED = "REPORT_GENERATED",
  REPORT_VIEWED = "REPORT_VIEWED",
  REPORT_DOWNLOAD_REQUESTED = "REPORT_DOWNLOAD_REQUESTED",
  LEAD_SUBMITTED = "LEAD_SUBMITTED",
}

export enum AuditEntityType {
  PRECHECK = "precheck",
  ORDER = "order",
  REPORT = "report",
  LEAD = "lead",
}

// ─── Versioning ─────────────────────────────────────────────

export const ENGINE_VERSION = "e1" as const;
export const TEMPLATE_VERSION = "v1" as const;
export const PDF_VERSION = "p1" as const;
export const DEFAULT_DISCLAIMER_VERSION = "d1" as const;

// ─── County ─────────────────────────────────────────────────

export enum County {
  SUFFOLK = "Suffolk",
  NASSAU = "Nassau",
  UNKNOWN = "Unknown",
}
