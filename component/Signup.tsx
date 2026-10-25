
"use client";
import { FormEvent, useState } from "react";

type SignupProps = {
  onSignup?: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
};

export default function Signup({ onSignup }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordScore = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const passwordLabel =
    password.length === 0
      ? ""
      : passwordScore <= 2
        ? "Weak password"
        : passwordScore <= 4
          ? "Good password"
          : "Strong password";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!onSignup) {
      setError("Authentication is not connected yet.");
      return;
    }

    setLoading(true);

    try {
      await onSignup({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f4f0] px-4 py-10 text-[#252522]">
      <section className="w-full max-w-[460px]">
        <a href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#252522] text-2xl font-bold text-[#ff713b] shadow-sm">
            P<span className="text-white">.</span>
          </span>
          <span className="text-2xl font-bold tracking-tight">
            Productive<span className="text-[#ff713b]">X</span>
          </span>
        </a>

        <div className="rounded-[28px] border border-[#e7e4dd] bg-white p-6 shadow-[0_8px_40px_rgba(37,37,34,0.04)] sm:p-9">
          <div className="mb-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#ff713b]">
              A fresh start
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Build better habits.
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#888880]">
              Create your account and make room for what matters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold">
                Your name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full rounded-xl border border-[#e5e3dc] bg-[#fdfcf9] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b0aea6] focus:border-[#ff713b] focus:ring-4 focus:ring-[#ff713b]/10"
                required
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold">
                Email address
              </label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-[#e5e3dc] bg-[#fdfcf9] px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-[#b0aea6] focus:border-[#ff713b] focus:ring-4 focus:ring-[#ff713b]/10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#85857d] hover:text-[#252522]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          passwordScore >= level
                            ? passwordScore <= 2
                              ? "bg-red-400"
                              : passwordScore <= 4
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                            : "bg-[#eeece6]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-[#85857d]">
                    {passwordLabel}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="mb-2 block text-sm font-semibold"
              >
                Confirm password
              </label>
              <input
                id="signup-confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter your password again"
                className="w-full rounded-xl border border-[#e5e3dc] bg-[#fdfcf9] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b0aea6] focus:border-[#ff713b] focus:ring-4 focus:ring-[#ff713b]/10"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600">
                  Passwords do not match.
                </p>
              )}
            </div>

            <p className="text-xs leading-5 text-[#929087]">
              By creating an account, you agree to use ProductiveX responsibly.
              Add your Terms of Service and Privacy Policy links here before launch.
            </p>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff713b] px-4 py-3.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(255,113,59,0.18)] transition hover:bg-[#ef632e] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating your account..." : "Create account"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#eeece6]" />
            <span className="text-xs text-[#aaa89f]">ALREADY A MEMBER?</span>
            <div className="h-px flex-1 bg-[#eeece6]" />
          </div>

          <p className="text-center text-sm text-[#85857d]">
            Already have an account?{" "}
            <a href="/login" className="font-bold text-[#e96532] hover:underline">
              Sign in
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#aaa89f]">
          Small steps. Better days. Your journey starts here.
        </p>
      </section>
    </main>
  );
}
