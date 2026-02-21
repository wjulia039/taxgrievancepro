import { CheckCircle2 } from "lucide-react";

export function CompleteProcess() {
  const processSteps = [
    {
      title: "Step 1: Property Information",
      description: "Collect basic property details including square footage, bedrooms, bathrooms, and current appraisal value.",
    },
    {
      title: "Step 2: Assessment Notice Review",
      description: "Enter your assessment notice details and identify any errors in the appraisal district's records.",
    },
    {
      title: "Step 3: Comparable Properties",
      description: "Find at least 5 similar properties sold in the past 2 years with lower price per square foot. We automatically calculate the average market value.",
    },
    {
      title: "Step 4: Tax Exemptions",
      description: "Select all tax exemptions you qualify for, including homestead, senior, veteran, or disability exemptions.",
    },
    {
      title: "Step 5: Secure Payment",
      description: "One-time payment of $19.99 to generate your professional appeal letter. Much cheaper than hiring a professional service.",
    },
    {
      title: "Step 6: Download Your Letter",
      description: "Get your professionally formatted appeal letter with all calculations and comparable property analysis ready to submit.",
    },
  ];

  return (
    <section className="mb-8 md:mb-12" aria-labelledby="process-heading">
      <h2 id="process-heading" className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
        Our Complete Process
      </h2>
      <div className="space-y-6">
        {processSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-background rounded-md md:rounded-lg shadow-sm border-l-4 border-primary/50"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
