"use client";

import * as React from "react";
import { saveSettings } from "@/actions/admin-actions";
import { Input, Label, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "@/components/ui/icons";
import type { SiteSettings } from "@/lib/settings";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = React.useState({
    businessName: settings.businessName,
    tagline: settings.tagline,
    address: settings.address,
    phones: settings.phones.join("\n"),
    email: settings.email,
    instagram: settings.instagram,
    whatsappNumber: settings.whatsappNumber,
    whatsappMessage: settings.whatsappMessage,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    aboutText: settings.aboutText,
    seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription,
    footerText: settings.footerText,
    distanceMode: settings.distanceMode,
    showPricePerKmGlobal: String(settings.showPricePerKmGlobal),
    autoDoubleReturn: String(settings.autoDoubleReturn),
    mapEmbedUrl: settings.mapEmbedUrl,
    ownerName: settings.ownerName,
    ownerBio: settings.ownerBio,
    ownerImage: settings.ownerImage,
  });
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await saveSettings(form);
    setBusy(false);
    setMsg(res.ok ? "Settings saved." : res.error || "Error");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Website Content & Settings</h1>
      <p className="text-sm text-slate-500">Edit business information, contact details and calculator behaviour.</p>

      <form onSubmit={save} className="mt-6 space-y-6">
        <Section title="Business information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><Label>Business name</Label><Input value={form.businessName} onChange={(e) => set("businessName", e.target.value)} /></div>
            <div><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label>Phone numbers (one per line)</Label><Textarea value={form.phones} onChange={(e) => set("phones", e.target.value)} className="min-h-[80px]" /></div>
            <div><Label>Instagram</Label><Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
            <div><Label>WhatsApp number (with country code)</Label><Input value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} /></div>
            <div><Label>WhatsApp pre-filled message</Label><Input value={form.whatsappMessage} onChange={(e) => set("whatsappMessage", e.target.value)} /></div>
          </div>
        </Section>

        <Section title="Homepage">
          <div className="grid grid-cols-1 gap-4">
            <div><Label>Hero title</Label><Input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} /></div>
            <div><Label>Hero subtitle</Label><Textarea value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} /></div>
          </div>
        </Section>

        <Section title="About & Owner">
          <div className="grid grid-cols-1 gap-4">
            <div><Label>About text</Label><Textarea value={form.aboutText} onChange={(e) => set("aboutText", e.target.value)} /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div><Label>Owner name</Label><Input value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} /></div>
              <div><Label>Owner image URL</Label><Input value={form.ownerImage} onChange={(e) => set("ownerImage", e.target.value)} /></div>
              <div><Label>Owner bio</Label><Input value={form.ownerBio} onChange={(e) => set("ownerBio", e.target.value)} /></div>
            </div>
          </div>
        </Section>

        <Section title="Pricing & distance behaviour">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Distance entry mode</Label>
              <Select value={form.distanceMode} onChange={(e) => set("distanceMode", e.target.value)}>
                <option value="auto">Auto (maps/estimate)</option>
                <option value="manual">Manual only</option>
                <option value="both">Both</option>
              </Select>
            </div>
            <div>
              <Label>Show price/km globally</Label>
              <Select value={form.showPricePerKmGlobal} onChange={(e) => set("showPricePerKmGlobal", e.target.value)}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div>
              <Label>Auto-double distance for round trips</Label>
              <Select value={form.autoDoubleReturn} onChange={(e) => set("autoDoubleReturn", e.target.value)}>
                <option value="true">Yes (×2)</option>
                <option value="false">No</option>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Label>Map embed URL (Google Maps)</Label>
              <Input value={form.mapEmbedUrl} onChange={(e) => set("mapEmbedUrl", e.target.value)} />
            </div>
          </div>
        </Section>

        <Section title="SEO & Footer">
          <div className="grid grid-cols-1 gap-4">
            <div><Label>SEO title</Label><Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></div>
            <div><Label>SEO description</Label><Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} /></div>
            <div><Label>Footer text</Label><Input value={form.footerText} onChange={(e) => set("footerText", e.target.value)} /></div>
          </div>
        </Section>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={busy}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Settings"}
          </Button>
          {msg && <span className="flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> {msg}</span>}
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 font-bold text-navy-900">{title}</h2>
      {children}
    </div>
  );
}
