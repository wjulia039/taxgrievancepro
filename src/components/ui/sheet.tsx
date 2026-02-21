"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextType>({
  open: false,
  setOpen: () => {},
});

function Sheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({
  children,
  asChild,
  className,
}: {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}) {
  const { setOpen } = React.useContext(SheetContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void; className?: string }>, {
      onClick: () => setOpen(true),
      className: cn((children as React.ReactElement<{ className?: string }>).props.className, className),
    });
  }

  return (
    <button className={className} onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

function SheetContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open, setOpen } = React.useContext(SheetContext);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm border-l border-border bg-card p-6 shadow-xl transition-transform",
          className
        )}
      >
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 text-muted-foreground"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </>
  );
}

export { Sheet, SheetTrigger, SheetContent };
