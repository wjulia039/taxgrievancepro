import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">
              Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, such as
              property details, contact information, and payment information
              when you use our Tax Appraisal Appeal Generator service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to generate your property tax
              appeal letter, process payments, and communicate with you about
              our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us at privacy@xprop.homes.
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
