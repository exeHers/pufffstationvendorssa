"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [ready, setReady] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // When user clicks the reset link, Supabase creates a recovery session automatically in-browser
    // We just need to ensure the session exists.
    (async () => {
      const { data } = await supabase.auth.getSession();
      setReady(Boolean(data.session));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updatePassword() {
    setErr("");
    setMsg("");

    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setMsg("Password updated ✅ You can now sign in.");
    setTimeout(() => (window.location.href = "/login"), 800);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xl font-semibold">Reset link not active</div>
          <p className="mt-2 text-sm text-white/70">
            Please open the reset-password link from your email again. If it keeps failing,
            request a new reset link from the Login page.
          </p>
          <a className="mt-4 inline-block underline text-white/80 hover:text-white" href="/login">
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-2xl font-semibold">Choose a new password</div>

        {err ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
            {err}
          </div>
        ) : null}

        {msg ? (
          <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm">
            {msg}
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <div className="mb-1 text-white/70">New password</div>
            <input
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="At least 8 characters"
            />
          </label>

          <label className="block text-sm">
            <div className="mb-1 text-white/70">Confirm password</div>
            <input
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              placeholder="Repeat new password"
            />
          </label>

          <button
            className="w-full rounded-md bg-white px-4 py-2 font-semibold text-black hover:opacity-90 disabled:opacity-50"
            disabled={loading}
            onClick={updatePassword}
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </div>
      </div>
    </div>
  );
}