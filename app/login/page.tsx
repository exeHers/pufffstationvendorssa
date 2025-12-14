"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function LoginPage() {
  const supabase = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey),
    []
  );

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = "/orders";
  }

  async function handleSignup() {
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Account created. Check your email to confirm.");
  }

  async function handleForgotPassword() {
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password reset email sent. Check your inbox.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold mb-2">
          {mode === "login" && "Login"}
          {mode === "signup" && "Sign Up"}
          {mode === "forgot" && "Reset Password"}
        </h1>

        <p className="text-sm text-white/70 mb-4">
          {mode === "login" && "Sign in to continue"}
          {mode === "signup" && "Create an account"}
          {mode === "forgot" && "We’ll email you a reset link"}
        </p>

        {error && (
          <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/30 p-2 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-3 rounded-md bg-green-500/10 border border-green-500/30 p-2 text-sm">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {mode !== "forgot" && (
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          {mode === "login" && (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-md bg-white text-black py-2 font-semibold"
            >
              Login
            </button>
          )}

          {mode === "signup" && (
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-md bg-white text-black py-2 font-semibold"
            >
              Sign Up
            </button>
          )}

          {mode === "forgot" && (
            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full rounded-md bg-white text-black py-2 font-semibold"
            >
              Send Reset Email
            </button>
          )}
        </div>

        <div className="mt-4 flex justify-between text-sm text-white/70">
          {mode !== "login" && (
            <button onClick={() => setMode("login")}>Back to login</button>
          )}
          {mode === "login" && (
            <>
              <button onClick={() => setMode("signup")}>Sign up</button>
              <button onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}