"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

import { getSupabaseBrowserClient } from "@/lib/supabase";

export function CallbackClient() {
  const router = useRouter();
  const params = useSearchParams();

  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const [status, setStatus] = useState<"working" | "ok" | "error">("working");

  useEffect(() => {
    const code = params.get("code");

    (async () => {
      if (!supabase) {
        setStatus("error");
        return;
      }

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("No active session");

        setStatus("ok");
        toast("Signed in", { description: "You can continue the wizard." });
        router.replace("/kit");
      } catch (e: unknown) {
        setStatus("error");
        const msg = e instanceof Error ? e.message : String(e);
        toast("Sign-in failed", { description: msg });
      }
    })();
  }, [params, router, supabase]);

  return (
    <main className="min-h-dvh bg-hero">
      <div className="mx-auto w-full max-w-xl px-5 py-14">
        <Card className="rounded-3xl p-6">
          <div className="font-heading text-2xl font-semibold">
            Signing you in...
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Status: {status}
          </div>

          <div className="mt-6 flex items-center gap-2">
            <Button asChild className="rounded-2xl">
              <Link href="/kit">Go to wizard</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
