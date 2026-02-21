"use client";

import { useEffect, useMemo, useState } from "react";

import { StepRail } from "@/components/kit/StepRail";
import { buildAppealPdf } from "@/components/kit/kit-pdf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  DEFAULT_KIT_STATE,
  calcPricePerSqft,
  type KitComparable,
  type KitState,
} from "@/lib/kit-schema";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "taxgrievancepro.kit.v1";

export function KitWizard() {
  const [s, setS] = useState<KitState>(() => {
    try {
      if (typeof window === "undefined") return DEFAULT_KIT_STATE;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_KIT_STATE;
      const parsed = JSON.parse(raw) as Partial<KitState>;
      return { ...DEFAULT_KIT_STATE, ...parsed };
    } catch {
      return DEFAULT_KIT_STATE;
    }
  });
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // ignore
    }
  }, [s]);

  const ppsf = useMemo(() => calcPricePerSqft(s.assessedValue, s.sqft), [s]);

  return (
    <div className="min-h-dvh bg-hero">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <div className="leading-tight">
          <div className="font-heading text-lg font-semibold">TaxGrievancePro</div>
          <div className="text-xs text-muted-foreground">
            NY Suffolk County • DIY wizard (MVP)
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-2xl"
            onClick={() => {
              setS(DEFAULT_KIT_STATE);
              setNotes("");
              toast("Reset", { description: "Cleared your current draft." });
            }}
          >
            Reset
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16">
        <StepRail step={s.step} />

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <Card className="rounded-3xl p-6 lg:col-span-8">
            {s.step === "property" && (
              <PropertyStep s={s} setS={setS} ppsf={ppsf} notes={notes} setNotes={setNotes} />
            )}
            {s.step === "assessment" && (
              <AssessmentStep s={s} setS={setS} />
            )}
            {s.step === "comparables" && (
              <ComparablesStep s={s} setS={setS} />
            )}
            {s.step === "exemptions" && <ExemptionsStep s={s} setS={setS} />}
            {s.step === "payment" && <PaymentStep s={s} setS={setS} />}
            {s.step === "complete" && <CompleteStep s={s} />}
          </Card>

          <Card className="rounded-3xl p-6 lg:col-span-4">
            <div className="text-sm font-semibold">Suffolk County, NY</div>
            <p className="mt-1 text-sm text-muted-foreground">
              This MVP is a guided DIY kit. Data auto-fill, login, and payments
              come next.
            </p>

            <div className="mt-5 rounded-3xl border bg-secondary/20 p-4">
              <div className="text-sm font-semibold">MVP mode</div>
              <div className="mt-2 text-sm text-muted-foreground">
                For now, you enter your key fields and comps manually.
              </div>
            </div>

            <Separator className="my-5" />

            <div className="text-xs text-muted-foreground">
              Disclaimer: informational tool only; not legal advice.
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function PropertyStep(props: {
  s: KitState;
  setS: React.Dispatch<React.SetStateAction<KitState>>;
  ppsf: number | null;
  notes: string;
  setNotes: (v: string) => void;
}) {
  const { s, setS } = props;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Property Information</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the subject property details.
          </p>
        </div>
        <div className="rounded-2xl border bg-secondary px-3 py-1 text-xs text-muted-foreground">
          Step 1 of 6
        </div>
      </div>

      <div className="mt-6 rounded-3xl border bg-secondary/30 p-4">
        <div className="text-sm font-semibold">Important note</div>
        <p className="mt-1 text-sm text-muted-foreground">
          If you plan to sell soon, a lower assessed value may affect perception.
          Use your judgment.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        <Field label="Property owner name">
          <Input
            placeholder="John Doe"
            value={s.ownerName}
            onChange={(e) => setS((p) => ({ ...p, ownerName: e.target.value }))}
          />
        </Field>

        <Field label="Property address line 1">
          <Input
            placeholder="123 Main Street"
            value={s.address1}
            onChange={(e) => setS((p) => ({ ...p, address1: e.target.value }))}
          />
        </Field>

        <Field label="Property address line 2 (optional)">
          <Input
            placeholder="Apt 4B"
            value={s.address2}
            onChange={(e) => setS((p) => ({ ...p, address2: e.target.value }))}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City">
            <Input
              placeholder="Smithtown"
              value={s.city}
              onChange={(e) => setS((p) => ({ ...p, city: e.target.value }))}
            />
          </Field>
          <Field label="State">
            <Input value="NY" disabled />
          </Field>
          <Field label="ZIP code">
            <Input
              placeholder="11787"
              value={s.zip}
              onChange={(e) => setS((p) => ({ ...p, zip: e.target.value }))}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Square footage">
            <Input
              inputMode="numeric"
              placeholder="2000"
              value={s.sqft}
              onChange={(e) => setS((p) => ({ ...p, sqft: toNumOrEmpty(e.target.value) }))}
            />
          </Field>
          <Field label="Year built">
            <Input
              inputMode="numeric"
              placeholder="1990"
              value={s.yearBuilt}
              onChange={(e) =>
                setS((p) => ({ ...p, yearBuilt: toNumOrEmpty(e.target.value) }))
              }
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bedrooms">
            <Input
              inputMode="numeric"
              placeholder="3"
              value={s.beds}
              onChange={(e) => setS((p) => ({ ...p, beds: toNumOrEmpty(e.target.value) }))}
            />
          </Field>
          <Field label="Bathrooms">
            <Input
              inputMode="decimal"
              placeholder="2.5"
              value={s.baths}
              onChange={(e) => setS((p) => ({ ...p, baths: toNumOrEmpty(e.target.value) }))}
            />
          </Field>
        </div>

        <Field label="Current assessed value">
          <Input
            inputMode="numeric"
            placeholder="450000"
            value={s.assessedValue}
            onChange={(e) =>
              setS((p) => ({ ...p, assessedValue: toNumOrEmpty(e.target.value) }))
            }
          />
        </Field>

        <div className="grid gap-3 rounded-3xl border bg-secondary/20 p-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold">Calculated price per sqft</div>
            <div className="text-xs text-muted-foreground">
              Based on assessed value and square footage
            </div>
          </div>
          <div
            className={cn("text-2xl font-semibold", !props.ppsf && "text-muted-foreground")}
          >
            {props.ppsf ? `$${props.ppsf.toFixed(2)}` : "$0.00"}
          </div>
        </div>

        <Field label="Notes (optional)">
          <Textarea
            placeholder="Anything to remember..."
            value={props.notes}
            onChange={(e) => props.setNotes(e.target.value)}
          />
        </Field>

        <div className="flex items-center justify-end gap-3">
          <Button
            className="rounded-2xl"
            size="lg"
            onClick={() => setS((p) => ({ ...p, step: "assessment" }))}
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}

function AssessmentStep(props: {
  s: KitState;
  setS: React.Dispatch<React.SetStateAction<KitState>>;
}) {
  const { s, setS } = props;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Assessment Notice</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the information from your notice.
          </p>
        </div>
        <div className="rounded-2xl border bg-secondary px-3 py-1 text-xs text-muted-foreground">
          Step 2 of 6
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tax year">
            <Input
              placeholder={String(new Date().getFullYear())}
              value={s.taxYear}
              onChange={(e) => setS((p) => ({ ...p, taxYear: e.target.value }))}
            />
          </Field>
          <Field label="Notice date">
            <Input
              type="date"
              value={s.noticeDate}
              onChange={(e) => setS((p) => ({ ...p, noticeDate: e.target.value }))}
            />
          </Field>
        </div>

        <div className="rounded-3xl border bg-secondary/20 p-4 text-sm text-muted-foreground">
          Deadline reminder: many jurisdictions require appeals within 30-45 days
          of notice. Confirm Suffolk County deadlines.
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setS((p) => ({ ...p, step: "property" }))}
          >
            Back
          </Button>
          <Button
            className="rounded-2xl"
            size="lg"
            onClick={() => setS((p) => ({ ...p, step: "comparables" }))}
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}

function ComparablesStep(props: {
  s: KitState;
  setS: React.Dispatch<React.SetStateAction<KitState>>;
}) {
  const { s, setS } = props;

  const [draft, setDraft] = useState<KitComparable>({
    address: "",
    saleDate: "",
    salePrice: 0,
    sqft: 0,
  });

  const compsPpsf = useMemo(() => {
    const values = s.comps
      .map((c) => (c.sqft > 0 ? c.salePrice / c.sqft : null))
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (!values.length) return null;
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    const median = values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { avg, median, n: values.length };
  }, [s.comps]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Comparable Sales</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add at least 5 similar sold properties to support your case.
          </p>
        </div>
        <div className="rounded-2xl border bg-secondary px-3 py-1 text-xs text-muted-foreground">
          Step 3 of 6
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="grid gap-3 rounded-3xl border bg-secondary/20 p-4">
          <div className="text-sm font-semibold">Add a comparable</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Address">
              <Input
                placeholder="123 Oak St, Smithtown, NY"
                value={draft.address}
                onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
              />
            </Field>
            <Field label="Sale date">
              <Input
                type="date"
                value={draft.saleDate}
                onChange={(e) => setDraft((p) => ({ ...p, saleDate: e.target.value }))}
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Sale price">
              <Input
                inputMode="numeric"
                placeholder="650000"
                value={draft.salePrice || ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, salePrice: toNumOrZero(e.target.value) }))
                }
              />
            </Field>
            <Field label="Sqft">
              <Input
                inputMode="numeric"
                placeholder="2100"
                value={draft.sqft || ""}
                onChange={(e) => setDraft((p) => ({ ...p, sqft: toNumOrZero(e.target.value) }))}
              />
            </Field>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setDraft({ address: "", saleDate: "", salePrice: 0, sqft: 0 })}
            >
              Clear
            </Button>
            <Button
              className="rounded-2xl"
              onClick={() => {
                if (!draft.address.trim()) {
                  toast("Missing address", { description: "Enter a comp address." });
                  return;
                }
                if (!draft.saleDate) {
                  toast("Missing sale date", { description: "Enter a sale date." });
                  return;
                }
                if (draft.salePrice <= 0 || draft.sqft <= 0) {
                  toast("Missing numbers", { description: "Enter sale price and sqft." });
                  return;
                }

                setS((p) => ({ ...p, comps: [...p.comps, { ...draft }] }));
                setDraft({ address: "", saleDate: "", salePrice: 0, sqft: 0 });
              }}
            >
              Add comp
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">Your comparables</div>
            <div className="text-xs text-muted-foreground">{s.comps.length} added</div>
          </div>
          <div className="mt-3 grid gap-2">
            {!s.comps.length && (
              <div className="text-sm text-muted-foreground">No comps yet.</div>
            )}
            {s.comps.map((c, idx) => {
              const ppsf = c.sqft > 0 ? c.salePrice / c.sqft : null;
              return (
                <div
                  key={idx}
                  className="flex flex-col gap-2 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.address}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.saleDate} • ${Math.round(c.salePrice).toLocaleString("en-US")} • {c.sqft} sqft
                      {ppsf ? ` • $${ppsf.toFixed(2)}/sqft` : ""}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() =>
                      setS((p) => ({
                        ...p,
                        comps: p.comps.filter((_, j) => j !== idx),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 rounded-3xl border bg-secondary/20 p-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold">Comps price per sqft</div>
            <div className="text-xs text-muted-foreground">Computed from your comps</div>
          </div>
          <div className={cn("text-sm", !compsPpsf && "text-muted-foreground")}>
            {compsPpsf
              ? `median $${compsPpsf.median.toFixed(2)} • avg $${compsPpsf.avg.toFixed(2)} (n=${compsPpsf.n})`
              : "-"}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setS((p) => ({ ...p, step: "assessment" }))}
          >
            Back
          </Button>
          <Button
            className="rounded-2xl"
            size="lg"
            onClick={() => {
              if (s.comps.length < 3) {
                toast("Add more comps", {
                  description: "MVP recommends at least 3 comps (goal 5+).",
                });
              }
              setS((p) => ({ ...p, step: "exemptions" }));
            }}
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExemptionsStep(props: {
  s: KitState;
  setS: React.Dispatch<React.SetStateAction<KitState>>;
}) {
  const { s, setS } = props;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Exemptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select any exemptions you believe apply (MVP placeholder).
          </p>
        </div>
        <div className="rounded-2xl border bg-secondary px-3 py-1 text-xs text-muted-foreground">
          Step 4 of 6
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <CheckRow
          label="Homestead"
          checked={s.exemptions.homestead}
          onCheckedChange={(v) =>
            setS((p) => ({
              ...p,
              exemptions: { ...p.exemptions, homestead: Boolean(v) },
            }))
          }
        />
        <CheckRow
          label="Senior"
          checked={s.exemptions.senior}
          onCheckedChange={(v) =>
            setS((p) => ({
              ...p,
              exemptions: { ...p.exemptions, senior: Boolean(v) },
            }))
          }
        />
        <CheckRow
          label="Veteran"
          checked={s.exemptions.veteran}
          onCheckedChange={(v) =>
            setS((p) => ({
              ...p,
              exemptions: { ...p.exemptions, veteran: Boolean(v) },
            }))
          }
        />
        <CheckRow
          label="Disability"
          checked={s.exemptions.disability}
          onCheckedChange={(v) =>
            setS((p) => ({
              ...p,
              exemptions: { ...p.exemptions, disability: Boolean(v) },
            }))
          }
        />
        <CheckRow
          label="Other"
          checked={s.exemptions.other}
          onCheckedChange={(v) =>
            setS((p) => ({
              ...p,
              exemptions: { ...p.exemptions, other: Boolean(v) },
            }))
          }
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setS((p) => ({ ...p, step: "comparables" }))}
          >
            Back
          </Button>
          <Button
            className="rounded-2xl"
            size="lg"
            onClick={() => setS((p) => ({ ...p, step: "payment" }))}
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentStep(props: {
  s: KitState;
  setS: React.Dispatch<React.SetStateAction<KitState>>;
}) {
  const { setS } = props;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Payment</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free beta: payments will be added later (Stripe).
          </p>
        </div>
        <div className="rounded-2xl border bg-secondary px-3 py-1 text-xs text-muted-foreground">
          Step 5 of 6
        </div>
      </div>

      <div className="mt-6 rounded-3xl border bg-secondary/20 p-4">
        <div className="text-sm font-semibold">Beta access</div>
        <div className="mt-1 text-sm text-muted-foreground">
          You can generate a demo PDF kit for review.
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => setS((p) => ({ ...p, step: "exemptions" }))}
        >
          Back
        </Button>
        <Button
          className="rounded-2xl"
          size="lg"
          onClick={() => setS((p) => ({ ...p, step: "complete" }))}
        >
          Generate kit
        </Button>
      </div>
    </div>
  );
}

function CompleteStep(props: { s: KitState }) {
  const { s } = props;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Complete</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Download your draft PDF kit.
          </p>
        </div>
        <div className="rounded-2xl border bg-secondary px-3 py-1 text-xs text-muted-foreground">
          Step 6 of 6
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="rounded-3xl border bg-secondary/20 p-4 text-sm text-muted-foreground">
          Reminder: review everything before submission. This is not legal advice.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="rounded-2xl"
            size="lg"
            onClick={() => {
              const doc = buildAppealPdf(s);
              doc.save(`TaxGrievancePro-Appeal-Kit-${Date.now()}.pdf`);
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl"
            size="lg"
            onClick={() => {
              navigator.clipboard
                .writeText(JSON.stringify(s, null, 2))
                .then(() => toast("Copied", { description: "Copied kit JSON." }))
                .catch(() => toast("Copy failed"));
            }}
          >
            Copy JSON
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm">{props.label}</Label>
      {props.children}
    </div>
  );
}

function CheckRow(props: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border bg-card p-4">
      <div className="text-sm font-medium">{props.label}</div>
      <Checkbox
        checked={props.checked}
        onCheckedChange={(v) => props.onCheckedChange(Boolean(v))}
      />
    </label>
  );
}

function toNumOrEmpty(v: string): number | "" {
  const trimmed = v.trim();
  if (!trimmed) return "";
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return "";
  return n;
}

function toNumOrZero(v: string): number {
  const trimmed = v.trim();
  if (!trimmed) return 0;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return 0;
  return n;
}
