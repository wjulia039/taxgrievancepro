import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="text-center space-y-6" aria-label="Hero section">
      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
        <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <h1 className="text-2xl md:text-5xl font-bold leading-tight">
        Lower Your Property Taxes
        <br />
        <span className="text-primary">With a Professional Appeal</span>
      </h1>
      <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Create a comprehensive tax appraisal value appeal document in minutes. Our step-by-step process guides you through everything you need to protest your property tax assessment.
      </p>
      <div className="flex justify-center">
        <Button
          asChild
          size="lg"
          className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Link href="/appeal">
            <span>Get Started Now</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
