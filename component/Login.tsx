
"use client";

import { FormEvent, useState } from "react";

type LoginProps = {
  onLogin?: (data: { email: string; password: string }) => Promise<void>;
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!onLogin) {
      setError("Authentication is not connected yet.");
      return;
    }

    setLoading(true);

    try {
      await onLogin({ email: email.trim(), password });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f4f0] px-4 py-10 text-[#252522]">
      <section className="w-full max-w-110">
        <a href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#252522] text-2xl font-bold text-[#ff713b] shadow-sm">
            P<span className="text-white">.</span>
          </span>
          <span className="text-2xl font-bold tracking-tight">
            Productive<span className="text-[#ff713b]">X</span>
          </span>
        </a>

        <div className="rounded-[28px] border border-[#e7e4dd] bg-white p-6 shadow-[0_8px_40px_rgba(37,37,34,0.04)] sm:p-9">
          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#ff713b]">
              Welcome back
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Good to see you.
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#888880]">
              Sign in and pick up where you left off.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#e5e3dc] bg-[#fdfcf9] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b0aea6] focus:border-[#ff713b] focus:ring-4 focus:ring-[#ff713b]/10"
                required
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="login-password" className="text-sm font-semibold">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#e96532] hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#e5e3dc] bg-[#fdfcf9] px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-[#b0aea6] focus:border-[#ff713b] focus:ring-4 focus:ring-[#ff713b]/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#85857d] hover:text-[#252522]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff713b] px-4 py-3.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(255,113,59,0.18)] transition hover:bg-[#ef632e] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing you in..." : "Sign in"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#eeece6]" />
            <span className="text-xs text-[#aaa89f]">YOUR PRODUCTIVITY STARTS HERE</span>
            <div className="h-px flex-1 bg-[#eeece6]" />
          </div>

          <p className="text-center text-sm text-[#85857d]">
            New to ProductiveX?{" "}
            <a href="/signup" className="font-bold text-[#e96532] hover:underline">
              Create an account
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#aaa89f]">
          Make today count, one step at a time.
        </p>
      </section>
    </main>
  );
}
