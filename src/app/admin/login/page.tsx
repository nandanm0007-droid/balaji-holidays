"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { loginAsAdmin } from "@/actions/auth-actions";
import { Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Loader2 } from "@/components/ui/icons";
import { BrandLogo } from "@/components/shared/brand-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const login = async () => {
    setError("");
    setBusy(true);
    const res = await loginAsAdmin(email.trim(), password);
    setBusy(false);
    if (!res.ok) return setError(res.error || "Could not log in.");
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto"><BrandLogo className="mx-auto h-14 w-14 rounded-xl shadow-gold" /></div>
          <h1 className="mt-3 text-xl font-bold text-navy-900">Admin Login</h1>
          <p className="text-sm text-slate-500">Balaji Holidays — management panel</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Admin email address</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" autoComplete="email" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your admin password" autoComplete="current-password" />
          </div>

          <Button onClick={login} disabled={busy} className="w-full">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Logging in…</> : "Login"}
          </Button>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}
