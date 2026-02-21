"use client";

import { Zap, DollarSign, ShieldCheck, Clock, FileCheck, Headphones } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      icon: DollarSign,
      title: "Save Thousands",
      description:
        "Most homeowners save between $500-$5,000 annually on their property taxes after a successful appeal.",
    },
    {
      icon: Zap,
      title: "Fast & Easy",
      description:
        "Complete your appeal in minutes, not hours. Our guided process makes it simple for anyone.",
    },
    {
      icon: ShieldCheck,
      title: "Professional Quality",
      description:
        "Generated letters follow best practices used by professional tax consultants and attorneys.",
    },
    {
      icon: Clock,
      title: "Deadline Tracking",
      description:
        "Never miss an appeal deadline. We help you stay on track with your local filing requirements.",
    },
    {
      icon: FileCheck,
      title: "Comparable Analysis",
      description:
        "Automatic calculation of comparable property values to strengthen your appeal case.",
    },
    {
      icon: Headphones,
      title: "Support Included",
      description:
        "Get help when you need it. Our support team is available to answer your questions.",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 md:py-28 relative"
      aria-labelledby="features-heading"
    >
      <div className="absolute inset-0 gradient-bg opacity-50" />
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            Features
          </p>
          <h2
            id="features-heading"
            className="text-3xl md:text-5xl font-bold tracking-tight"
          >
            Why Choose Us
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Everything you need to successfully appeal your property tax assessment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
