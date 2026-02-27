'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  AlertTriangle,
  ArrowDown,
  Bell,
  CheckCircle,
  Download,
  FileText,
  Home,
  Info,
  Lock,
  Loader2,
  Mail,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

// ── Types ─────────────────────────────────────────────────────────────────
interface Comp {
  address: string;
  sale_price: number;
  sold_date: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  distance_miles?: number;
  source: string;
}

interface PropertyDetail {
  assessed_value?: number;
  assessment_year?: number;
  parcel_id?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  year_built?: number;
  county?: string;
}

interface PrecheckResult {
  source: string;
  precheck: {
    id: string;
    decision: string;
    confidence: number;
    factors: string[];
    metrics: {
      assessed_value: number;
      comps_used_count: number;
      comps_lower_count: number;
      comps_lower_ratio: number;
      best_lower_comp_gap: number;
    };
  };
  comps: Comp[];
  property: PropertyDetail;
}

// ── Animation phases ───────────────────────────────────────────────────────
const PHASES = [
  { text: 'Validating address...', from: 0, to: 20, durationMs: 1000 },
  { text: 'Fetching comparable sales...', from: 20, to: 55, durationMs: 5000 },
  { text: 'Computing eligibility...', from: 55, to: 95, durationMs: 500 },
  { text: 'Done', from: 95, to: 100, durationMs: 500 },
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1]! + sorted[mid]!) / 2)
    : sorted[mid]!;
}

function fmtUsd(n: number) {
  return '$' + Math.round(n).toLocaleString();
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const supabase = useSupabase();

  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState<string>(PHASES[0]!.text);
  const [result, setResult] = useState<PrecheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [legalChecked, setLegalChecked] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const apiDone = useRef(false);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getToken = useCallback(async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  // Animation — runs independently of API call
  useEffect(() => {
    const requestData = sessionStorage.getItem('precheck_request');
    if (!requestData) {
      router.push('/home/check');
      return;
    }

    let currentPhase = 0;
    let phaseStartTime = Date.now();

    animationRef.current = setInterval(() => {
      if (apiDone.current) {
        setProgress(100);
        setPhaseText('Done');
        if (animationRef.current) clearInterval(animationRef.current);
        return;
      }

      const phase = PHASES[currentPhase];
      if (!phase) return;

      const elapsed = Date.now() - phaseStartTime;
      const ratio = Math.min(1, elapsed / phase.durationMs);
      setProgress(phase.from + (phase.to - phase.from) * ratio);
      setPhaseText(phase.text);

      if (ratio >= 1 && currentPhase < PHASES.length - 2) {
        currentPhase++;
        phaseStartTime = Date.now();
      }
    }, 80);

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [router]);

  // API call — runs in parallel with animation
  useEffect(() => {
    const requestData = sessionStorage.getItem('precheck_request');
    if (!requestData) return;

    let cancelled = false;

    (async () => {
      try {
        const token = await getToken();
        if (!token) { router.push('/auth/sign-in'); return; }

        const response = await fetch('/api/precheck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: requestData,
        });

        if (cancelled) return;

        if (response.status === 429) { setError('Too many requests. Please try again later.'); apiDone.current = true; return; }
        if (response.status === 400) { const d = await response.json(); setError(d.error ?? 'Invalid request.'); apiDone.current = true; return; }
        if (!response.ok) { setError('Something went wrong. Please try again.'); apiDone.current = true; return; }

        const data: PrecheckResult = await response.json();
        apiDone.current = true;
        await new Promise((r) => setTimeout(r, 600));
        if (!cancelled) {
          setResult(data);
          sessionStorage.removeItem('precheck_request');
        }
      } catch {
        if (!cancelled) { setError('Network error. Please check your connection.'); apiDone.current = true; }
      }
    })();

    return () => { cancelled = true; };
  }, [getToken, router]);

  // Purchase handler
  const handlePurchase = async () => {
    if (!legalChecked || !result) return;
    setPurchasing(true);
    try {
      const token = await getToken();
      if (!token) { router.push('/auth/sign-in'); return; }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          precheck_id: result.precheck.id,
          legal_accepted_at: new Date().toISOString(),
          disclaimer_version: 'd1',
        }),
      });
      if (!response.ok) { const d = await response.json(); setError(d.error ?? 'Failed to create order.'); setPurchasing(false); return; }
      const { checkout_url } = await response.json();
      window.location.href = checkout_url;
    } catch { setError('Network error. Please try again.'); setPurchasing(false); }
  };

  // Notify Me handler
  const handleNotifyMe = async () => {
    if (!notifyEmail || notifySubmitted) return;
    try {
      const token = await getToken();
      if (!token) return;
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: notifyEmail, tag: `WAITLIST_${new Date().getFullYear() + 1}` }),
      });
      setNotifySubmitted(true);
    } catch { /* non-critical */ }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!result && !error) {
    return (
      <div className="flex flex-grow items-center justify-center p-6">
        <div className="max-w-lg space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{phaseText}</h2>
          <p className="text-sm text-muted-foreground">Estimated time: ~10-15 seconds</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error && !result) {
    return (
      <div className="flex flex-grow items-center justify-center p-6">
        <div className="max-w-lg space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <XCircle className="size-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push('/home/check')}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  // ── Computed values ────────────────────────────────────────────────────────
  const isEligible = result.precheck.decision === 'ELIGIBLE';
  const m = result.precheck.metrics;
  const confidencePct = Math.round(result.precheck.confidence * 100);

  const compPrices = result.comps.map((c) => c.sale_price);
  const estimatedMarketValue = median(compPrices);
  const assessedValue = m.assessed_value;
  const overAssessmentAmt = assessedValue - estimatedMarketValue;
  const estimatedSavings = Math.max(0, overAssessmentAmt * 0.02);
  const overAssessmentPct = assessedValue > 0 ? Math.round((overAssessmentAmt / assessedValue) * 100) : 0;

  const confidenceLabel = confidencePct >= 70 ? 'High' : confidencePct >= 40 ? 'Medium' : 'Low';

  // ── Results UI ─────────────────────────────────────────────────────────────
  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

        {/* ── Left Column: Results & Actions ── */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Decision Badge + Title */}
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold border ${
              isEligible
                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
            }`}>
              {isEligible ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
              {isEligible ? 'Analysis Complete' : 'Analysis Complete'}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
              {isEligible
                ? 'Your Property Tax Report is Ready!'
                : 'No Eligible Appeal Found'}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              {isEligible
                ? <>We&apos;ve identified discrepancies in your assessment. Based on comparable sales in <span className="font-semibold text-foreground">{result.property.county ?? 'your'} County</span>, you are eligible for an appeal.</>
                : 'Based on current comparable sales data, we did not find sufficient evidence of over-assessment at this time.'}
            </p>
          </div>

          {/* Key Findings Card */}
          {isEligible && (
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-primary/50 dark:border-gray-800 dark:bg-[#1a2332] group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowDown className="size-20 text-primary" />
              </div>
              <div className="relative z-10 grid grid-cols-2 gap-6">
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Estimated Savings</p>
                  <p className="text-3xl font-bold text-primary">
                    {fmtUsd(estimatedSavings)}<span className="text-lg font-normal text-muted-foreground">/yr</span>
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Success Probability</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-foreground">{confidenceLabel}</p>
                    <TrendingUp className="size-5 text-green-500" />
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Over-assessment detected</p>
                    <p className="text-xs text-muted-foreground">
                      Your assessed value is {overAssessmentPct}% higher than comparable sales median.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          {isEligible ? (
            <div className="space-y-4">
              {/* PRD §12, §22: Compliance reminder above payment button */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 space-y-0.5 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                <p><strong>Reminder:</strong> RP-524 filing is free through your local assessor/BAR.</p>
                <p>You are purchasing report preparation and analysis only.</p>
              </div>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={legalChecked}
                  onChange={(e) => setLegalChecked(e.target.checked)}
                  className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary/20 dark:border-gray-600"
                />
                <span className="text-sm text-muted-foreground">
                  I understand this report is an estimate and does not guarantee a tax reduction.
                </span>
              </label>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handlePurchase}
                  disabled={!legalChecked || purchasing}
                  className="flex flex-1 items-center justify-center gap-3 rounded-lg bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 group"
                >
                  <Download className="size-5 group-hover:animate-bounce" />
                  {purchasing ? 'Redirecting to payment...' : 'Unlock Full Report ($9.99)'}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 dark:border-gray-800 dark:bg-[#1a2332]">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Bell className="size-5" /> Get Notified for Next Year
              </h3>
              <p className="text-sm text-muted-foreground">
                Leave your email and we&apos;ll alert you when new sales data suggests you may be eligible.
              </p>
              {notifySubmitted ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle className="size-4" /> We&apos;ll notify you when new data is available.
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800/50"
                  />
                  <button
                    onClick={handleNotifyMe}
                    disabled={!notifyEmail}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    Notify Me
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Report generated on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Valid for the {new Date().getFullYear() + 1} tax year appeals window.
          </p>
        </div>

        {/* ── Right Column: Data Preview ── */}
        <div className="order-1 lg:order-2 space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Assessed Value"
              value={assessedValue ? fmtUsd(assessedValue) : 'N/A'}
              sub={result.property.assessment_year?.toString()}
            />
            <MetricCard
              label="Est. Market Value"
              value={estimatedMarketValue ? fmtUsd(estimatedMarketValue) : 'N/A'}
              sub="median of comps"
              highlight={isEligible && estimatedMarketValue < assessedValue}
            />
            <MetricCard
              label="Over-Assessment"
              value={overAssessmentAmt > 0 ? fmtUsd(overAssessmentAmt) : '\u2014'}
              sub="assessed - market"
              highlight={isEligible}
            />
            <MetricCard
              label="Est. Annual Savings"
              value={estimatedSavings > 0 ? fmtUsd(estimatedSavings) : '\u2014'}
              sub="~2% effective rate"
              highlight={isEligible}
            />
          </div>

          {/* Property Details */}
          {(result.property.beds || result.property.sqft || result.property.year_built) && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1a2332]">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Home className="size-4 text-muted-foreground" />
                <span>Property Details</span>
                {result.property.county && (
                  <span className="ml-auto text-xs font-normal text-muted-foreground">{result.property.county} County</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {result.property.beds != null && <span className="text-muted-foreground">{result.property.beds} beds</span>}
                {result.property.baths != null && <span className="text-muted-foreground">{result.property.baths} baths</span>}
                {result.property.sqft != null && <span className="text-muted-foreground">{result.property.sqft.toLocaleString()} sqft</span>}
                {result.property.year_built != null && <span className="text-muted-foreground">Built {result.property.year_built}</span>}
                {result.property.parcel_id && <span className="col-span-2 text-muted-foreground">Parcel: {result.property.parcel_id}</span>}
              </div>
            </div>
          )}

          {/* Comparable Sales Table */}
          {result.comps.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#1a2332]">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3 dark:border-gray-800 dark:bg-[#101622]/50">
                <h3 className="text-sm font-semibold text-foreground">
                  Comparable Sales ({result.comps.length} found)
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Recent nearby sales used to estimate market value
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30">
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Address</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Sale Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Sold</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">vs Assessed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {result.comps.map((comp, i) => {
                      const below = assessedValue > 0 && comp.sale_price < assessedValue;
                      const diff = assessedValue > 0
                        ? ((comp.sale_price - assessedValue) / assessedValue * 100).toFixed(1)
                        : null;
                      return (
                        <tr key={i} className="hover:bg-primary/5 transition-colors">
                          <td className="max-w-[180px] truncate px-4 py-2.5 text-xs text-foreground">{comp.address}</td>
                          <td className={`px-4 py-2.5 text-right font-medium ${below ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                            {fmtUsd(comp.sale_price)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{fmtDate(comp.sold_date)}</td>
                          <td className={`px-4 py-2.5 text-right text-xs font-medium ${below ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                            {diff !== null ? `${Number(diff) > 0 ? '+' : ''}${diff}%` : '\u2014'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2 text-xs text-muted-foreground dark:border-gray-800 dark:bg-gray-900/30">
                Green = sold below assessed value (supports grievance). Source: {result.source === 'CACHE' ? 'Cached' : (() => { const sources = [...new Set((result.comps ?? []).map((c) => c.source).filter(Boolean))]; return sources.length ? sources.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ') : 'Data Sources'; })()}.
              </div>
            </div>
          )}

          {/* NY Compliance Banner — PRD §8, §22 */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-1.5 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
              <Info className="size-4 shrink-0" />
              Important Notice
            </div>
            <ul className="ml-6 space-y-1 text-xs text-blue-700 dark:text-blue-400">
              <li>RP-524 filing is free through your local assessor/BAR.</li>
              <li>You are purchasing report preparation and analysis only.</li>
              <li>We are not affiliated with any government agency.</li>
              <li>You may be required to attend a hearing.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Next Steps Section ── */}
      {isEligible && (
        <div className="mx-auto max-w-5xl w-full mt-12 sm:mt-16 border-t border-gray-200 pt-10 dark:border-gray-800">
          <h3 className="mb-6 text-xl font-bold text-foreground">Recommended Next Steps</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StepCard
              number="1"
              title="Review the Report"
              desc="Check the comparable properties we selected to ensure they match your home's characteristics."
            />
            <StepCard
              number="2"
              title="Sign the Appeal Form"
              desc="The last page of the PDF is the official appeal form. Print, sign, and date it."
            />
            <StepCard
              number="3"
              title="Submit Before Deadline"
              desc="Mail the package to your County Assessor's office. Address is provided in the report."
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, highlight }: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      highlight
        ? 'border-primary/30 bg-primary/5 dark:border-primary/20 dark:bg-primary/10'
        : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-[#1a2332]'
    }`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Step Card ──────────────────────────────────────────────────────────────
function StepCard({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-primary/30 dark:border-gray-800 dark:bg-[#1a2332]">
      <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 font-bold text-muted-foreground dark:border-gray-700 dark:bg-gray-800">
        {number}
      </div>
      <h4 className="mb-2 font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
