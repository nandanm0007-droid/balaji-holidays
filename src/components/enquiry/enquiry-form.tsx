"use client";

import * as React from "react";
import { submitEnquiry } from "@/actions/enquiry-actions";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "@/components/ui/icons";

export function EnquiryForm() {
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await submitEnquiry(form);
    setBusy(false);
    if (!res.ok) return setError(res.error || "Could not submit enquiry.");
    setDone(true);
  };

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h3 className="mt-3 text-xl font-bold text-navy-900">Enquiry Submitted</h3>
        <p className="mt-1 text-sm text-slate-500">
          Thank you! Balaji Holidays will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Name *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <Label>Phone *</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="10-digit mobile" />
        </div>
        <div>
          <Label>Email (optional)</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <Label>Subject</Label>
          <Input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="e.g. Bus rental enquiry" />
        </div>
        <div className="sm:col-span-2">
          <Label>Message *</Label>
          <Textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Tell us about your trip — destination, dates, number of passengers…"
          />
        </div>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      <Button type="submit" disabled={busy} className="mt-4">
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit Enquiry"}
      </Button>
    </form>
  );
}
