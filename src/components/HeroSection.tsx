"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative text-center space-y-8 py-20 md:py-32 overflow-hidden" aria-label="Hero section">
      {/* Background gradient effect */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 grid-pattern" />

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground mb-8">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Professional Tax Appeal Letters</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
          Lower Your Property Taxes{" "}
          <br className="hidden md:block" />
          <span className="gradient-text">With Confidence</span>
        </h1>

        <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
          Create a comprehensive tax appraisal value appeal document in minutes.
          Our step-by-step process guides you through everything you need to
          protest your property tax assessment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button
            asChild
            size="lg"
            className="text-base px-8 py-6 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
          >
            <Link href="/appeal">
              <span>Start Your Appeal</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-base px-8 py-6 rounded-full"
          >
            <Link href="/#how-it-works">
              <span>Learn More</span>
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-xl mx-auto">
          <div>
            <div className="text-2xl md:text-3xl font-bold text-foreground">$19.99</div>
            <div className="text-sm text-muted-foreground mt-1">One-time fee</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-foreground">5 min</div>
            <div className="text-sm text-muted-foreground mt-1">To complete</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-foreground">Pro</div>
            <div className="text-sm text-muted-foreground mt-1">Quality letter</div>
          </div>
        </div>
      </div>
    </section>
  );
}
