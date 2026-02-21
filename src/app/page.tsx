import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { CompleteProcess } from "@/components/CompleteProcess";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { ChatButton } from "@/components/ChatButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />

        <div className="border-t border-border">
          <HowItWorks />
        </div>

        <div className="border-t border-border">
          <CompleteProcess />
        </div>

        <div className="border-t border-border">
          <WhyChooseUs />
        </div>

        <CTASection />

        {/* Important Notice */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <aside className="text-center text-sm text-muted-foreground space-y-2 border-t border-border pt-8">
            <p>
              <strong className="text-foreground">Important Notice:</strong>{" "}
              This tool helps you create a professional tax appeal letter. Always
              review the generated letter and consult with a tax professional if
              needed.
            </p>
            <p>
              <strong className="text-foreground">Deadline Reminder:</strong>{" "}
              Most appeals must be filed within 30-45 days of receiving your
              assessment notice. Check your local appraisal district for specific
              deadlines.
            </p>
          </aside>
        </div>
      </main>
      <Footer />
      <ChatButton />
    </div>
  );
}
