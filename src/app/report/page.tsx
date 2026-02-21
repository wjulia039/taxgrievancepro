import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function ReportPage() {
  const subject = {
    address: "123 Example St, Smithtown, NY 11787",
    beds: 3,
    baths: 2.5,
    sqft: 2000,
    assessedValue: 450000,
    noticeDate: "2026-01-15",
  };

  const comps = [
    {
      address: "10 Oak Ave, Smithtown, NY",
      saleDate: "2025-11-20",
      salePrice: 410000,
      sqft: 1950,
    },
    {
      address: "55 Cedar Rd, Smithtown, NY",
      saleDate: "2025-12-05",
      salePrice: 425000,
      sqft: 2050,
    },
    {
      address: "8 Pine Ln, Smithtown, NY",
      saleDate: "2026-01-02",
      salePrice: 399000,
      sqft: 1900,
    },
  ];

  const compPpsf = comps.map((c) => c.salePrice / c.sqft);
  const avgPpsf = compPpsf.reduce((a, b) => a + b, 0) / compPpsf.length;
  const marketEstimate = Math.round(avgPpsf * subject.sqft);
  const delta = subject.assessedValue - marketEstimate;

  return (
    <div className="min-h-dvh bg-hero">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-8">
        <Link href="/" className="font-heading text-lg font-semibold">
          TaxGrievancePro
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-2xl">
            <a href="/api/report/pdf" target="_blank" rel="noreferrer">
              Download PDF
            </a>
          </Button>
          <Button asChild className="rounded-2xl">
            <Link href="/kit">Back to wizard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-20">
        <Card className="rounded-3xl border-foreground/10 bg-card/80 p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Suffolk County, NY • Draft report
              </div>
              <h1 className="mt-1 font-heading text-3xl font-semibold">
                Preliminary Appeal Review
              </h1>
              <div className="mt-2 text-sm text-muted-foreground">
                Informational guidance tool. Not legal advice.
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Generated: {new Date().toLocaleDateString("en-US")}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-background p-5">
              <div className="text-sm font-semibold">Subject property</div>
              <div className="mt-2 text-sm text-muted-foreground">
                <div>{subject.address}</div>
                <div>
                  {subject.beds} bd • {subject.baths} ba • {subject.sqft} sqft
                </div>
                <div>Notice date: {subject.noticeDate}</div>
                <div>
                  Assessed value: ${subject.assessedValue.toLocaleString("en-US")}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-5">
              <div className="text-sm font-semibold">Market signal (draft)</div>
              <div className="mt-2 text-sm text-muted-foreground">
                <div>
                  Average comps $/sqft: ${avgPpsf.toFixed(2)}
                </div>
                <div>
                  Market estimate: ${marketEstimate.toLocaleString("en-US")}
                </div>
                <div>
                  Difference vs assessed: {delta >= 0 ? "-" : "+"}$
                  {Math.abs(delta).toLocaleString("en-US")}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold">Comparable sales</div>
            <div className="mt-3 overflow-hidden rounded-2xl border bg-background">
              <div className="grid grid-cols-12 gap-3 border-b px-4 py-3 text-xs font-semibold text-muted-foreground">
                <div className="col-span-6">Address</div>
                <div className="col-span-2">Sale date</div>
                <div className="col-span-2 text-right">Sale price</div>
                <div className="col-span-2 text-right">$/sqft</div>
              </div>
              {comps.map((c) => {
                const ppsf = c.salePrice / c.sqft;
                return (
                  <div
                    key={c.address}
                    className="grid grid-cols-12 gap-3 px-4 py-3 text-sm"
                  >
                    <div className="col-span-6 text-foreground">{c.address}</div>
                    <div className="col-span-2 text-muted-foreground">
                      {c.saleDate}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground">
                      ${c.salePrice.toLocaleString("en-US")}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground">
                      ${ppsf.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border bg-secondary/30 p-5">
            <div className="text-sm font-semibold">Next steps</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Review your notice carefully, verify property facts, and ensure any
              comparable sales are truly similar. Consider consulting a local
              professional if you are unsure.
            </div>
          </div>

          <div className="mt-8 text-xs text-muted-foreground">
            Informational guidance tool. Not legal advice.
          </div>
        </Card>
      </main>
    </div>
  );
}
