"use client";

import { ClipboardList, Search, Download } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: ClipboardList,
      number: "01",
      title: "Enter Your Information",
      description:
        "Provide your property details, assessment notice information, and find comparable properties that sold for less.",
    },
    {
      icon: Search,
      number: "02",
      title: "Review & Customize",
      description:
        "Check for assessment errors, select applicable tax exemptions, and ensure all information is accurate.",
    },
    {
      icon: Download,
      number: "03",
      title: "Pay & Download",
      description:
        "One-time payment of $19.99 to generate and download your professional appeal letter ready to submit.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            Process
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl md:text-5xl font-bold tracking-tight"
          >
            How It Works
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Three simple steps to create your professional property tax appeal letter.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative p-8 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
            >
              <div className="absolute top-6 right-6 text-5xl font-bold text-muted/50 select-none">
                {step.number}
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
