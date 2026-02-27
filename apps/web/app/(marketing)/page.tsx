import Link from 'next/link';

import { withI18n } from '~/lib/i18n/with-i18n';

function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#101622] py-16 sm:py-24 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-gradient-to-br from-[#101622] via-[#101622]/80 to-primary/20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#101622] via-[#101622]/80 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Stop Overpaying on{' '}
            <span className="text-primary">Property Taxes</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 sm:text-xl">
            Get a free instant assessment and find out if you&apos;re eligible for
            a reduction. We generate a professional appeal report for Long Island
            homeowners in minutes.
          </p>

          {/* Search Bar CTA */}
          <div className="mx-auto mt-10 max-w-xl">
            <Link
              href="/home/check"
              className="relative flex flex-col gap-2 rounded-xl bg-white p-2 shadow-xl sm:flex-row"
            >
              <div className="relative flex flex-1 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="absolute left-3 size-5 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                <span className="flex h-12 w-full items-center rounded-lg py-3 pl-10 pr-4 text-sm text-gray-400">
                  Enter your home address...
                </span>
              </div>
              <span className="flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white shadow-sm transition-all hover:bg-blue-600 sm:w-auto">
                Check Savings
              </span>
            </Link>
            <p className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-green-400">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
              No credit card required for initial check
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────────────── */}
      <section
        id="pricing"
        className="border-y border-gray-200 bg-white py-10 dark:border-gray-800 dark:bg-[#1a2332]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Suffolk &amp; Nassau County</dt>
              <dd className="text-3xl font-bold tracking-tight text-foreground">Long Island</dd>
            </div>
            <div className="flex flex-col gap-1 border-gray-100 dark:border-gray-800 sm:border-l sm:border-r">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Report Price</dt>
              <dd className="text-3xl font-bold tracking-tight text-primary">$9.99</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Savings</dt>
              <dd className="text-3xl font-bold tracking-tight text-foreground">$1,200+/yr</dd>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ──────────────────────────────────── */}
      <section id="how-it-works" className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold leading-8 text-primary">Simple Process</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How TaxGrievancePro Works</p>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              We demystify the property tax appeal process. Three steps to potential savings.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-[#1a2332] dark:ring-gray-800">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7">
                  <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                  <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold leading-8 text-foreground">1. Enter Property Details</h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  Provide your address and basic home information so we can locate your tax records instantly.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-[#1a2332] dark:ring-gray-800">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7">
                  <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold leading-8 text-foreground">2. Get Instant Analysis</h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  Our smart algorithm compares your home to similar local properties to find discrepancies in your assessment.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-[#1a2332] dark:ring-gray-800">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7">
                  <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                  <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold leading-8 text-foreground">3. Receive Your PDF Report</h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  Download a comprehensive, professional appeal package with comps and analysis ready to file with your county.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us Section ─────────────────────────────────── */}
      <section id="why-us" className="bg-white py-16 dark:bg-[#1a2332]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Choose TaxGrievancePro?
              </h2>
              <p className="text-lg text-muted-foreground">
                We combine real estate data expertise with tax law knowledge to give you the best chance of reducing your property assessment.
              </p>
              <ul className="space-y-4">
                <FeatureItem
                  icon={<path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />}
                  title="Data-Driven Accuracy"
                  desc="We analyze comparable properties using real sales data to build your strongest case."
                />
                <FeatureItem
                  icon={<><path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" /><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749C15.7 15.953 16.1 15.17 16.1 14.34c0-.828-.4-1.611-1.113-2.177A4.124 4.124 0 0 0 13.25 11.412V8.406c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" /></>}
                  title="Maximize Your Savings"
                  desc="Our reports are designed to highlight the maximum allowable reduction based on real comparable sales."
                />
                <FeatureItem
                  icon={<path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />}
                  title="Fast & Affordable"
                  desc="Skip the expensive lawyers. Get your professional appeal packet in minutes for just $9.99."
                />
                <FeatureItem
                  icon={<path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />}
                  title="Built for Long Island"
                  desc="Specialized for Suffolk & Nassau County homeowners. Our data sources and rules are tuned for NY tax grievance processes."
                />
              </ul>
              <div className="pt-4">
                <Link href="/home/check" className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white transition-colors hover:bg-blue-600">
                  Start My Free Analysis
                </Link>
              </div>
            </div>

            {/* Right side — savings card */}
            <div className="w-full max-w-md flex-1 lg:max-w-full">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-primary/20 p-8 shadow-xl dark:from-primary/10 dark:to-primary/5">
                <div className="space-y-6">
                  <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-[#101622]">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                          <path fillRule="evenodd" d="M1.72 5.47a.75.75 0 0 1 1.06 0L9 11.69l3.756-3.756a.75.75 0 0 1 .985-.066 12.698 12.698 0 0 1 4.575 6.832.75.75 0 0 1-1.464.326 11.199 11.199 0 0 0-3.3-5.232l-3.772 3.772a.75.75 0 0 1-1.06 0L2.78 7.59l-1.06 1.06a.75.75 0 0 1-1.06-1.06l2.06-2.06Z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Potential Savings Found</p>
                        <p className="text-xl font-bold text-foreground">$1,850 <span className="text-sm font-normal text-muted-foreground">/ year</span></p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Assessed Value</span>
                        <span className="font-semibold text-foreground">$520,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Market Value (est.)</span>
                        <span className="font-semibold text-green-600">$427,500</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Over-Assessment</span>
                        <span className="font-semibold text-primary">$92,500</span>
                      </div>
                    </div>
                  </div>
                  <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-green-500">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                    </svg>
                    Based on 6 comparable sales
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tax Grievance Process Section ─────────────────────────── */}
      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold leading-8 text-primary">NY Tax Grievance Process</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What You Need to Know</p>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Property tax grievances in New York allow homeowners to challenge their assessed value. Here&apos;s what the process looks like.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-6">
            {[
              { step: '1', title: 'Review Your Assessment', desc: 'Check your property tax bill for the assessed value. Compare it with recent sales of similar homes in your area.' },
              { step: '2', title: 'Gather Evidence', desc: 'Collect comparable sales data, photos of property issues, and any documentation supporting a lower value. Our report handles this for you.' },
              { step: '3', title: 'File Form RP-524', desc: 'Submit the official grievance form to your local Board of Assessment Review (BAR) before the deadline. Filing is free.' },
              { step: '4', title: 'Attend Hearing (if needed)', desc: 'Present your evidence at the BAR hearing. Many grievances are resolved without a hearing based on the submitted evidence.' },
              { step: '5', title: 'Receive Decision', desc: 'The BAR will issue a decision. If approved, your assessed value is reduced, lowering your future tax bills.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-[#1a2332] dark:ring-gray-800">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{item.step}</div>
                <div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────────── */}
      <section className="bg-[#101622] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Check Your Eligibility?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            It takes less than a minute. Enter your address and find out if you&apos;re overpaying on property taxes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/home/check" className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-blue-600">
              Get Started Free
            </Link>
            <Link href="/auth/sign-in" className="inline-flex h-12 items-center justify-center rounded-lg border border-gray-600 px-8 text-base font-bold text-gray-300 transition-colors hover:bg-white/10">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* PRD §13, §22: NY compliance disclaimer on landing page */}
      <section className="border-t border-gray-200 bg-white py-10 dark:border-gray-800 dark:bg-[#1a2332]">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <p className="mb-2 font-semibold text-foreground">Important Information</p>
            <p>
              Filing form RP-524 with your local assessor or Board of Assessment Review (BAR) is{' '}
              <strong>completely free</strong>. The $9.99 fee is for our assessment analysis and report preparation service only.
            </p>
            <p className="mt-2">
              TaxGrievancePro is not affiliated with any town, county, or state government agency. We do not provide legal or tax advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
          {icon}
        </svg>
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}

export default withI18n(HomePage);
