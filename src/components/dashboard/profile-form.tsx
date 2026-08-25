"use client";

import * as React from "react";
import { updateProfile } from "@/actions/auth-actions";
import { Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function ProfileForm({ initialName, initialEmail }: { initialName?: string | null; initialEmail?: string | null }) {
  const [name, setName] = React.useState(initialName || "");
  const [email, setEmail] = React.useState(initialEmail || "");
  const [msg, setMsg] = React.useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile(name, email);
    setMsg(res.ok ? "Profile updated." : res.error || "Error");
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Button type="submit" size="sm">Save</Button>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
    </form>
  );
}
