"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Logo } from "@/components/ui/logo";

function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] pl-10 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40"
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Enter your email address.");
    if (!password) return setError("Enter your password.");
    setSubmitting(true);
    try {
      await login(email.trim(), password, remember);
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 15% 10%, rgba(20,184,166,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(59,130,246,0.10) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 blueprint-dots opacity-60"
          style={{ maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-12 w-12" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl text-white">CoatLab</span>
              <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-teal-400">
                Materials Intelligence
              </span>
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to continue to your workspace.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">
                Password
              </label>
              <PasswordField
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/[0.03] accent-teal-500"
              />
              Remember me
            </label>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-semibold text-black transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            New to CoatLab?{" "}
            <Link href="/signup" className="font-medium text-teal-400 hover:text-teal-300">
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Protected by end-to-end session authentication
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
