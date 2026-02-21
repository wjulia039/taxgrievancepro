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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto max-w-4xl flex flex-col">
        <main className="flex-1 flex flex-col px-2 md:px-0">
          {/* Title Section */}
          <div className="relative text-center mb-8 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Tax Appraisal Appeal Generator</h1>
            <p className="text-muted-foreground text-sm md:text-lg">Create a professional property tax appeal letter in minutes</p>
          </div>

          {/* Main Content Card */}
          <div className="space-y-12 md:bg-background min-[915px]:rounded-lg min-[915px]:shadow-lg p-4 md:p-8">
            <HeroSection />
            <HowItWorks />
            <CompleteProcess />
            <WhyChooseUs />
            <CTASection />

            {/* Important Notice */}
            <aside className="text-center text-sm text-muted-foreground space-y-2 border-t px-2 pt-8 md:pt-12">
              <p><strong>Important Notice:</strong> This tool helps you create a professional tax appeal letter. Always review the generated letter and consult with a tax professional if needed.</p>
              <p><strong>Deadline Reminder:</strong> Most appeals must be filed within 30-45 days of receiving your assessment notice. Check your local appraisal district for specific deadlines.</p>
            </aside>
          </div>
        </main>
        <Footer />
      </div>
      <ChatButton />
    </div>
  );
}
