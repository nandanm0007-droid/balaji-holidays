"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "@/actions/auth-actions";
import { Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Loader2 } from "@/components/ui/icons";
import { BrandLogo } from "@/components/shared/brand-logo";

export function EmailLogin({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const login = async () => {
    setError("");
    setBusy(true);
    const res = await loginWithEmail(email.trim(), password, name.trim());
    setBusy(false);
    if (!res.ok) return setError(res.error || "Could not log in.");
    router.push(next || "/dashboard");
    router.refresh();
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <BrandLogo className="mx-auto h-14 w-14 rounded-2xl ring-1 ring-gold-400/30 shadow-soft-lg" />
        <h2 className="mt-4 font-display text-xl font-bold text-navy-900">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use your email address and password to continue.
        </p>
      </div>
      <div className="mt-6 space-y-4">
        <div>
          <Label>Email address</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" autoComplete="email" />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="current-password" />
        </div>
        <div>
          <Label>Your name (only for new accounts)</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />
        </div>
        <Button onClick={login} disabled={busy} className="w-full">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Logging in…</> : "Continue"}
        </Button>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}