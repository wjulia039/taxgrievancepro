"use client";

import {
  Home,
  FileText,
  Search,
  Shield,
  CreditCard,
  Download,
} from "lucide-react";

export function CompleteProcess() {
  const processSteps = [
    {
      icon: Home,
      title: "Property Information",
      description:
        "Collect basic property details including square footage, bedrooms, bathrooms, and current appraisal value.",
    },
    {
      icon: FileText,
      title: "Assessment Notice Review",
      description:
        "Enter your assessment notice details and identify any errors in the appraisal district's records.",
    },
    {
      icon: Search,
      title: "Comparable Properties",
      description:
        "Find at least 5 similar properties sold in the past 2 years with lower price per square foot.",
    },
    {
      icon: Shield,
      title: "Tax Exemptions",
      description:
        "Select all tax exemptions you qualify for, including homestead, senior, veteran, or disability exemptions.",
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description:
        "One-time payment of $19.99 to generate your professional appeal letter. Much cheaper than hiring a professional.",
    },
    {
      icon: Download,
      title: "Download Your Letter",
      description:
        "Get your professionally formatted appeal letter with all calculations and comparable property analysis.",
    },
  ];

  return (
    <section className="py-20 md:py-28" aria-labelledby="process-heading">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            Step by Step
          </p>
          <h2
            id="process-heading"
            className="text-3xl md:text-5xl font-bold tracking-tight"
          >
            Our Complete Process
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            A detailed walkthrough of every step in creating your appeal.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processSteps.map((step, index) => (
            <div
              key={index}
              className="group flex items-start gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">{step.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
