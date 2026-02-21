import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-hero flex flex-col">
      <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-sm">TG</span>
          </div>
          <span className="font-semibold hidden sm:inline">TaxGrievancePro</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/report" className="hover:text-foreground transition-colors">
            Report preview
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Log in
          </Link>
          <Button asChild>
            <Link href="/kit">Start Free Eligibility Review</Link>
          </Button>
        </nav>
        <div className="sm:hidden">
          <Button asChild size="sm">
            <Link href="/kit">Start</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl flex-1 flex flex-col">
        <main className="flex-1 flex flex-col px-2 md:px-0 py-10">
          <div className="relative text-center mb-8 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              Suffolk County Property Tax Appeal Kit
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg">
              Prepare a submission-ready appeal kit with a clear comps table and
              a clean PDF.
            </p>
          </div>

          <div className="space-y-10 md:bg-background min-[915px]:rounded-lg min-[915px]:shadow-lg p-4 md:p-8">
            <section className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                <div className="font-semibold mb-1">
                  1) Provide property &amp; assessment details
                </div>
                <div className="text-sm text-muted-foreground">
                  Enter the facts from your notice.
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                <div className="font-semibold mb-1">
                  2) Review or add comparable sales
                </div>
                <div className="text-sm text-muted-foreground">
                  Add recent sales that support your position.
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                <div className="font-semibold mb-1">
                  3) Generate and review your appeal kit
                </div>
                <div className="text-sm text-muted-foreground">
                  Download a PDF for review before submission.
                </div>
              </div>
            </section>

            <section className="text-center">
              <Button asChild size="lg" className="px-10">
                <Link href="/kit">Start Free Eligibility Review</Link>
              </Button>
              <div className="mt-3 text-xs text-muted-foreground">
                Informational guidance tool. Not legal advice.
              </div>
            </section>

            <aside className="text-center text-sm text-muted-foreground space-y-2 border-t px-2 pt-8">
              <p>
                <strong>Important Notice:</strong> Review any generated materials
                carefully before submission.
              </p>
              <p>
                <strong>Deadline Reminder:</strong> Many appeals must be filed
                within a short window after receiving your notice. Confirm
                Suffolk County deadlines.
              </p>
            </aside>
          </div>

          <footer className="text-center text-xs text-muted-foreground mt-10">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link className="hover:underline" href="/privacy">
                Privacy
              </Link>
              <span>•</span>
              <Link className="hover:underline" href="/terms">
                Terms
              </Link>
              <span>•</span>
              <Link className="hover:underline" href="/disclaimer">
                Disclaimer
              </Link>
              <span>•</span>
              <span>Informational guidance tool. Not legal advice.</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
