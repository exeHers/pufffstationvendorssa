"use client";

import { useEffect, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AuthCallbackPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  useEffect(() => {
    (async () => {
      // This will pick up the session after email confirmation / magic link.
      await supabase.auth.getSession();
      window.location.href = "/orders";
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-10 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-xl font-semibold">Signing you in…</div>
        <p className="mt-2 text-sm text-white/70">You’ll be redirected shortly.</p>
      </div>
    </div>
  );
}