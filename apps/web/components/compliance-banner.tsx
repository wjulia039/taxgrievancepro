/**
 * PRD §19, §22: Persistent sitewide NY compliance copy.
 * Rendered in both marketing footer and dashboard layout.
 */

export function ComplianceBanner() {
  return (
    <div className="border-t bg-gray-50 py-3">
      <div className="container mx-auto px-4 text-center text-[11px] text-muted-foreground space-y-0.5">
        <p>
          TaxGrievancePro is not affiliated with any town, county, or state
          government agency. This product does not provide legal or tax advice.
        </p>
        <p>
          RP-524 filing is free through your local assessor or Board of
          Assessment Review (BAR). You are purchasing report preparation and
          analysis only.
        </p>
      </div>
    </div>
  );
}
