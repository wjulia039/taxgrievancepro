"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="min-h-dvh bg-hero">
      <div className="mx-auto w-full max-w-xl px-5 py-14">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-heading text-lg font-semibold">
            TaxGrievancePro
          </Link>
          <Button asChild variant="ghost" className="rounded-2xl">
            <Link href="/kit">Back to wizard</Link>
          </Button>
        </div>

        <Card className="mt-8 rounded-3xl p-6">
          <h1 className="font-heading text-2xl font-semibold">Log in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Well email you a secure sign-in link. No password.
          </p>

          {!supabase && (
            <div className="mt-4 rounded-2xl border bg-secondary/30 p-4 text-sm text-muted-foreground">
              Supabase is not configured on this deployment yet.
            </div>
          )}

          <div className="mt-6 grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <Button
              className="mt-2 rounded-2xl"
              size="lg"
              disabled={!supabase || busy || !email.trim()}
              onClick={async () => {
                if (!supabase) return;
                setBusy(true);
                try {
                  const redirectTo = `${window.location.origin}/auth/callback`;
                  const { error } = await supabase.auth.signInWithOtp({
                    email: email.trim(),
                    options: { emailRedirectTo: redirectTo },
                  });
                  if (error) throw error;
                  toast("Check your email", {
                    description: "We sent you a sign-in link.",
                  });
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : String(e);
                  toast("Login failed", {
                    description: msg,
                  });
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Sending..." : "Send magic link"}
            </Button>

            <div className="text-xs text-muted-foreground">
              By continuing, you agree to our <Link className="underline" href="/terms">Terms</Link>.
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
