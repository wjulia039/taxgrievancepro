import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <header className="h-16 px-6 flex items-center sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using the Tax Appraisal Appeal Generator service,
              you accept and agree to be bound by the terms and conditions of
              this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Service Description
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service provides tools to help you create a professional
              property tax appeal letter. The service is for informational
              purposes only and does not constitute legal or tax advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              A one-time payment of $19.99 is required to generate and download
              your appeal letter. All payments are non-refundable once the letter
              has been generated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not guarantee any specific outcome from using our service.
              Success in property tax appeals depends on various factors
              including local regulations and the accuracy of information
              provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at
              legal@xprop.homes.
            </p>
          </section>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Last updated: February 2026
        </p>
      </div>
    </div>
  );
}
