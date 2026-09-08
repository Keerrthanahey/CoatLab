"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { UserRound, Mail, Check, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, type AuthUser } from "@/components/auth/auth-provider";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase().slice(0, 2);
}

function Avatar({ name, src, size = "lg" }: { name: string; src?: string | null; size?: "lg" | "md" }) {
  const dims = size === "lg" ? "h-16 w-16 text-xl" : "h-9 w-9 text-sm";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- runtime user avatar URL, resizable by origin
    return <img src={src} alt={name} className={`${dims} shrink-0 rounded-full border border-white/10 object-cover`} />;
  }
  return (
    <div
      className={`${dims} flex shrink-0 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10 font-semibold text-teal-300`}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </div>
  );
}

function ProfileForm({ initialUser }: { initialUser: AuthUser }) {
  const { updateProfile } = useAuth();
  const [fullName, setFullName] = useState(initialUser.fullName);
  const [domain, setDomain] = useState(initialUser.domain ?? "");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveStatus("idle");
    if (!fullName.trim()) return setError("Display name is required.");
    setSaving(true);
    try {
      await updateProfile({ fullName: fullName.trim(), domain: domain.trim() || undefined });
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      setError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
      <Field label="Display name" hint="How your name appears across the platform.">
        <TextInput
          id="profile-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </Field>
      <Field
        label="Research domain"
        unit="optional"
        hint="e.g. Magnesium alloys, surface engineering. Stored on your account."
      >
        <TextInput
          id="profile-domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g. Magnesium surface engineering"
        />
      </Field>
      <Field label="Email" hint="Used for sign-in. Not editable here.">
        <TextInput id="profile-email" value={initialUser.email} readOnly />
      </Field>

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}
      {saveStatus === "saved" && (
        <p className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
          <Check className="h-3.5 w-3.5" />
          Saved successfully.
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="md" loading={saving} disabled={saving}>
          {!saving && saveStatus !== "saved" && <UserRound className="h-4 w-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
        {saveStatus === "error" && (
          <span className="text-xs text-red-400">Unable to save changes.</span>
        )}
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    setSigningOut(true);
    await logout();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <SectionHeader eyebrow="Account" title="Profile" description="Your CoatLab identity and preferences." />
        <Card>
          <p className="text-sm text-slate-400">
            You are not signed in.{" "}
            <Link href="/login" className="font-medium text-teal-400 hover:text-teal-300">
              Sign in
            </Link>{" "}
            to view your profile.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Account"
        title="Profile"
        description="View and manage your CoatLab identity."
      />

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <Card>
            <div className="flex items-center gap-4">
              <Avatar name={user.fullName} src={user.avatarUrl} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">{user.fullName}</p>
                <p className="flex items-center gap-1.5 truncate text-xs text-slate-400">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {user.email}
                </p>
                <div className="mt-2">
                  <Badge tone={user.provider === "google" ? "blue" : "teal"} dot>
                    {user.provider === "google" ? "Google account" : "Email & password"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Session"
              subtitle="Sign out ends the session on this device."
              icon={<ShieldCheck className="h-4 w-4" />}
            />
            <div className="mt-4">
              <Button
                variant="danger"
                size="md"
                onClick={onSignOut}
                loading={signingOut}
                disabled={signingOut}
                className="w-full"
              >
                <LogOut className="h-4 w-4" />
                {signingOut ? "Signing out…" : "Sign Out"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              title="Edit profile"
              subtitle="Changes are persisted to your account and reflected across CoatLab."
              icon={<UserRound className="h-4 w-4" />}
            />
            <ProfileForm key={user.id} initialUser={user} />
          </Card>
        </div>
      </div>
    </div>
  );
}