import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="bg-hero">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl border bg-card text-sm font-semibold">
            TG
          </div>
          <div className="leading-tight">
            <div className="font-heading text-base font-semibold">
              TaxGrievancePro
            </div>
            <div className="text-xs text-muted-foreground">
              Local Property Tax Appeal Guidance
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link className="hover:text-foreground" href="#how-it-works">
            How it works
          </Link>
          <Link className="hover:text-foreground" href="#faq">
            FAQ
          </Link>
          <Button asChild className="rounded-2xl">
            <Link href="/kit">Start Free Eligibility Review</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Button asChild className="rounded-2xl">
            <Link href="/kit">Start Free Eligibility Review</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8">
        <section className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              Suffolk County, NY • DIY appeal kit
            </div>
            <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              Prepare a submission-ready property tax appeal kit for Suffolk
              County.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              Provide your property and assessment details, review comparable
              sales, and generate a clean PDF kit you can review before filing.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="rounded-2xl">
                <Link href="/kit">Start Free Eligibility Review</Link>
              </Button>
              <div className="text-sm text-muted-foreground">
                Free for first users • No credit card
              </div>
            </div>

            <div id="how-it-works" className="mt-10 grid gap-3 sm:grid-cols-3">
              <Card className="rounded-3xl border-foreground/10 bg-card/80 p-5">
                <div className="text-sm font-semibold">
                  1) Provide property &amp; assessment details
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Confirm the basic facts from your notice.
                </div>
              </Card>
              <Card className="rounded-3xl border-foreground/10 bg-card/80 p-5">
                <div className="text-sm font-semibold">
                  2) Review or add comparable sales
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Add recent sales that support your position.
                </div>
              </Card>
              <Card className="rounded-3xl border-foreground/10 bg-card/80 p-5">
                <div className="text-sm font-semibold">
                  3) Generate and review your appeal kit
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Download a PDF you can review before submission.
                </div>
              </Card>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Card className="rounded-3xl border-foreground/10 bg-card/70 p-5">
                <div className="text-sm font-semibold">Local focus</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Built specifically for Suffolk County, NY.
                </div>
              </Card>
              <Card className="rounded-3xl border-foreground/10 bg-card/70 p-5">
                <div className="text-sm font-semibold">Privacy-first</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Minimize what you share. No scraping.
                </div>
              </Card>
              <Card className="rounded-3xl border-foreground/10 bg-card/70 p-5">
                <div className="text-sm font-semibold">Clear process</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Simple steps, readable output, no fluff.
                </div>
              </Card>
            </div>

            <div id="faq" className="mt-10 rounded-3xl border bg-card/60 p-6">
              <div className="text-sm font-semibold">FAQ (beta)</div>
              <div className="mt-2 text-sm text-muted-foreground">
                This is an informational guidance tool. Always review your kit
                before submission, and consult a professional if needed.
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="rounded-3xl border-foreground/10 bg-card/70 p-6 backdrop-blur">
              <div className="text-sm font-semibold">What you get</div>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <div>• Subject property summary</div>
                <div>• Comparable sales table</div>
                <div>• Price-per-sqft calculations</div>
                <div>• A clean appeal kit PDF</div>
                <div>• Evidence checklist + next steps</div>
              </div>
              <div className="mt-6 rounded-2xl border bg-background p-4 text-xs text-muted-foreground">
                Informational guidance tool. Not legal advice.
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-10 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <Link className="underline-offset-4 hover:underline" href="/privacy">
            Privacy
          </Link>
          <span>•</span>
          <Link className="underline-offset-4 hover:underline" href="/terms">
            Terms
          </Link>
          <span>•</span>
          <Link className="underline-offset-4 hover:underline" href="/disclaimer">
            Disclaimer
          </Link>
          <span>•</span>
          <span>Informational guidance tool. Not legal advice.</span>
        </div>
      </footer>
    </div>
  );
}
