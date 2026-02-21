import { cn } from "@/lib/utils";
import type { KitStepId } from "@/lib/kit-schema";

const STEPS: { id: KitStepId; title: string; subtitle: string }[] = [
  { id: "property", title: "Property Info", subtitle: "Basic details" },
  { id: "assessment", title: "Assessment", subtitle: "Review notice" },
  { id: "comparables", title: "Comparables", subtitle: "Add comps" },
  { id: "exemptions", title: "Exemptions", subtitle: "Tax breaks" },
  { id: "payment", title: "Payment", subtitle: "Free beta" },
  { id: "complete", title: "Complete", subtitle: "Get letter" },
];

export function StepRail(props: { step: KitStepId }) {
  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.id === props.step),
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {STEPS.map((s, idx) => {
        const isActive = idx === activeIndex;
        const isDone = idx < activeIndex;

        return (
          <div
            key={s.id}
            className={cn(
              "rounded-2xl border bg-card p-4 transition",
              isActive && "border-primary/30 ring-1 ring-primary/15",
              isDone && "border-foreground/10 opacity-85",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border text-sm font-semibold",
                  isActive && "border-primary/40 bg-primary text-primary-foreground",
                  isDone && "border-foreground/10 bg-secondary",
                  !isActive && !isDone && "border-foreground/15 bg-background",
                )}
              >
                {idx + 1}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{s.title}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {s.subtitle}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
