"use client";

import * as React from "react";
import { submitPackageEnquiry } from "@/actions/enquiry-actions";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "@/components/ui/icons";

export function PackageEnquiryForm({ packageId, packageName }: { packageId: string; packageName: string }) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [travelDate, setTravelDate] = React.useState("");
  const [passengers, setPassengers] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);

  const validate = () => {
    if (name.trim().length < 2) return "Please enter your name.";
    if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) return "Please enter a valid phone number.";
    return "";
  };

  const submit = async () => {
    const e = validate();
    if (e) return setError(e);
    setError("");
    setBusy(true);
    const enq = await submitPackageEnquiry({
      packageId,
      name,
      phone: phone.trim(),
      email,
      travelDate: travelDate || null,
      passengers: passengers ? Number(passengers) : undefined,
      message,
    });
    setBusy(false);
    if (!enq.ok) return setError(enq.error || "Could not submit enquiry.");
    setDone(true);
  };

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h3 className="mt-3 text-xl font-bold text-navy-900">Enquiry Submitted Successfully</h3>
        <p className="mt-1 text-sm text-slate-500">
          Thank you! Balaji Holidays will contact you soon regarding {packageName}.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold text-navy-900">Enquire about this package</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Phone *</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" />
        </div>
        <div>
          <Label>Email (optional)</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Preferred travel date</Label>
          <Input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
        </div>
        <div>
          <Label>Passengers</Label>
          <Input type="number" min={1} value={passengers} onChange={(e) => setPassengers(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Message (optional)</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        <Button onClick={submit} disabled={busy} className="mt-4">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit Enquiry"}
        </Button>
    </div>
  );
}
