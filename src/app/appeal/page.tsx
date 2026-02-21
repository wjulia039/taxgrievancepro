"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { usePaymentStore } from "@/store/paymentStore";
import {
  ArrowLeft,
  Home,
  FileText,
  Search,
  Shield,
  CreditCard,
  Download,
  Check,
} from "lucide-react";

export default function AppealPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { hasPaid } = usePaymentStore();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      icon: Home,
      title: "Property Info",
      description: "Enter your property details",
    },
    {
      icon: FileText,
      title: "Assessment",
      description: "Review your notice",
    },
    {
      icon: Search,
      title: "Comparables",
      description: "Find similar sales",
    },
    {
      icon: Shield,
      title: "Exemptions",
      description: "Select applicable exemptions",
    },
    {
      icon: CreditCard,
      title: "Payment",
      description: "One-time $19.99 payment",
    },
    {
      icon: Download,
      title: "Download",
      description: "Get your appeal ready",
    },
  ];

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 4) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        router.push("/payment");
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (hasPaid) {
    return (
      <div className="min-h-screen">
        <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </header>
        <div className="max-w-4xl mx-auto py-16 px-4">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Your Appeal Letter is Ready!
            </h2>
            <p className="text-muted-foreground mb-6">
              You&apos;ve already completed the payment. Download your appeal
              letter below.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-xl">
                <Download className="mr-2 h-5 w-5" />
                Download Appeal Letter
              </Button>
              <Button variant="outline" size="lg" className="rounded-xl" asChild>
                <Link href="/payment/success">View Order Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold hidden sm:inline">
            Tax Appeal Generator
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Progress Steps */}
        <div className="mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Start Your Property Tax Appeal
          </h1>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center text-center p-2 md:p-4 rounded-xl transition-all cursor-pointer border ${
                  index + 1 === currentStep
                    ? "bg-primary/10 border-primary/50"
                    : index + 1 < currentStep
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-card border-border"
                }`}
                onClick={() =>
                  index + 1 < currentStep && setCurrentStep(index + 1)
                }
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 ${
                    index + 1 === currentStep
                      ? "bg-primary text-primary-foreground"
                      : index + 1 < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>
                <span
                  className={`text-[10px] md:text-xs font-medium ${
                    index + 1 === currentStep
                      ? "text-primary"
                      : index + 1 < currentStep
                      ? "text-green-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold mb-2">
            Step {currentStep}: {steps[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground mb-6">
            {steps[currentStep - 1].description}
          </p>

          {currentStep === 1 && (
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Address
                  </label>
                  <input
                    type="text"
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City, State, ZIP
                  </label>
                  <input
                    type="text"
                    placeholder="Austin, TX 78701"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Square Footage
                  </label>
                  <input
                    type="number"
                    placeholder="2,500"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    placeholder="4"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    placeholder="3"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Appraisal Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <input
                      type="text"
                      placeholder="450,000"
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Year Built
                  </label>
                  <input
                    type="number"
                    placeholder="2005"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assessment Notice Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notice Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <input
                      type="text"
                      placeholder="475,000"
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Any Errors Found?
                </label>
                <textarea
                  placeholder="Describe any errors you've noticed in the assessment..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Add at least 5 comparable properties that sold for less than
                your assessed value.
              </p>
              <div className="space-y-4">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className="p-4 border border-border rounded-lg bg-muted/30"
                  >
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          placeholder="456 Oak Street"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Sale Price
                        </label>
                        <input
                          type="text"
                          placeholder="$420,000"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Sq. Ft.
                        </label>
                        <input
                          type="text"
                          placeholder="2,400"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                + Add Another Property
              </Button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Select all tax exemptions that apply to your property.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    id: "homestead",
                    label: "Homestead Exemption",
                    desc: "Primary residence",
                  },
                  {
                    id: "senior",
                    label: "Senior Citizen",
                    desc: "Age 65 or older",
                  },
                  {
                    id: "veteran",
                    label: "Veteran Exemption",
                    desc: "Military service",
                  },
                  {
                    id: "disability",
                    label: "Disability Exemption",
                    desc: "Qualified disability",
                  },
                ].map((exemption) => (
                  <label
                    key={exemption.id}
                    className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors bg-card"
                  >
                    <input type="checkbox" className="mt-1 accent-primary" />
                    <div>
                      <p className="font-medium">{exemption.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {exemption.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-8 border-t border-border mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button onClick={handleContinue}>
              {currentStep === 4 ? (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Continue to Payment
                </>
              ) : (
                `Continue to Step ${currentStep + 1}`
              )}
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Need help? Check out our{" "}
            <Link href="/" className="text-primary hover:underline">
              FAQ
            </Link>{" "}
            or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
