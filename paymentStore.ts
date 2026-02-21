export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Enter Your Information",
      description: "Provide your property details, assessment notice information, and find comparable properties that sold for less.",
    },
    {
      number: "2",
      title: "Review & Customize",
      description: "Check for assessment errors, select applicable tax exemptions, and ensure all information is accurate.",
    },
    {
      number: "3",
      title: "Pay & Download",
      description: "One-time payment of $19.99 to generate and download your professional appeal letter ready to submit.",
    },
  ];

  return (
    <section
      className="bg-primary/5 rounded-md md:rounded-2xl p-4 md:p-8 md:shadow-sm mb-8 md:mb-12"
      aria-labelledby="how-it-works-heading"
    >
      <h2 id="how-it-works-heading" className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-8">
        How It Works
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div key={step.number} className="bg-background rounded-md md:rounded-xl p-6 md:shadow-sm">
            <div className="bg-primary/15 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">{step.number}</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
            <p className="text-muted-foreground text-sm">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
