"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 md:p-16 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to Lower Your{" "}
              <span className="gradient-text">Property Taxes?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Join thousands of homeowners who have successfully reduced their
              property taxes with our professional appeal letters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="text-base px-8 py-6 rounded-full shadow-lg shadow-primary/25"
              >
                <Link href="/appeal">
                  <span>Get Started — $19.99</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              One-time payment. No subscription. No hidden fees.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
