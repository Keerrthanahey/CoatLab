"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  ArrowRight,
  FlaskConical,
} from "lucide-react";
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

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError("Enter your full name.");
    if (!email.trim()) return setError("Enter your email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        domain: domain.trim() || undefined,
      });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Start exploring AI-powered coating intelligence.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-xs font-medium text-slate-400">
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Doe"
                  autoComplete="name"
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Password
                </label>
                <PasswordField
                  value={password}
                  onChange={setPassword}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Confirm password
                </label>
                <PasswordField
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="domain" className="mb-1.5 block text-xs font-medium text-slate-400">
                Research domain <span className="text-slate-600">(optional)</span>
              </label>
              <div className="relative">
                <FlaskConical className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Corrosion science, surface engineering…"
                  className="h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-semibold text-black transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {submitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-teal-400 hover:text-teal-300">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Passwords are hashed server-side with scrypt — never stored in plain text
        </p>
      </div>
    </div>
  );
}
