import { Suspense } from "react";

import { CallbackClient } from "@/app/auth/callback/CallbackClient";

export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-hero" />}>
      <CallbackClient />
    </Suspense>
  );
}
