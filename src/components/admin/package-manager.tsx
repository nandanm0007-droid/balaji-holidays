"use client";

import * as React from "react";
import { savePackage, deletePackage } from "@/actions/admin-actions";
import { parseJSON, formatINR } from "@/lib/utils";
import { packagePriceLabel } from "@/lib/package-price";
import { Input, Label, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, PenLine, Loader2, X } from "@/components/ui/icons";

type PackageRow = {
  id: string;
  name: string;
  slug: string;
  destination: string;
  startingLocation: string;
  durationDays: number;
  placesCovered: string;
  itinerary: string;
  description: string | null;
  pricingType: string;
  price: number | null;
  perPersonPrice: number | null;
  vehicleIds: string;
  active: boolean;
  featured: boolean;
  images: { url: string }[];
};

type VehicleOpt = { id: string; name: string };

const empty = {
  id: "",
  name: "",
  destination: "",
  startingLocation: "Shivamogga",
  durationDays: "2",
  placesCovered: "",
  itinerary: "",
  description: "",
  pricingType: "CONTACT",
  price: "",
  perPersonPrice: "",
  images: "",
  active: "true",
  featured: "false",
};

export function PackageManager({
  packages,
  vehicles,
  vehicleIdsByPackage,
}: {
  packages: PackageRow[];
  vehicles: VehicleOpt[];
  vehicleIdsByPackage: Record<string, string[]>;
}) {
  const [editing, setEditing] = React.useState<Record<string, string> | null>(null);
  const [selVehicles, setSelVehicles] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const set = (k: string, v: string) => setEditing((f) => (f ? { ...f, [k]: v } : f));

  const startEdit = (p: PackageRow) => {
    setEditing({
      ...empty,
      id: p.id,
      name: p.name,
      destination: p.destination,
      startingLocation: p.startingLocation,
      durationDays: String(p.durationDays),
      placesCovered: parseJSON<string[]>(p.placesCovered, []).join("\n"),
      itinerary: parseJSON<string[]>(p.itinerary, []).join("\n"),
      description: p.description || "",
      pricingType: p.pricingType,
      price: p.price != null ? String(p.price) : "",
      perPersonPrice: p.perPersonPrice != null ? String(p.perPersonPrice) : "",
      images: p.images.map((i) => i.url).join("\n"),
      active: String(p.active),
      featured: String(p.featured),
    });
    setSelVehicles(vehicleIdsByPackage[p.id] || parseJSON<string[]>(p.vehicleIds, []));
    setError("");
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    const res = await savePackage({ ...editing, vehicleIds: selVehicles }, editing.id || undefined);
    setBusy(false);
    if (!res.ok) return setError(res.error || "Error");
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Package Management</h1>
        <Button variant="gold" onClick={() => { setEditing({ ...empty }); setSelVehicles([]); setError(""); }}>
          <Plus className="h-4 w-4" /> Add Package
        </Button>
      </div>

      {editing && (
        <div className="card mt-6 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">{editing.id ? "Edit Package" : "Add Package"}</h2>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><Label>Package name *</Label><Input value={editing.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div><Label>Destination</Label><Input value={editing.destination} onChange={(e) => set("destination", e.target.value)} /></div>
            <div><Label>Starting location</Label><Input value={editing.startingLocation} onChange={(e) => set("startingLocation", e.target.value)} /></div>
            <div><Label>Duration (days)</Label><Input type="number" value={editing.durationDays} onChange={(e) => set("durationDays", e.target.value)} /></div>
            <div><Label>Pricing type</Label>
              <Select value={editing.pricingType} onChange={(e) => set("pricingType", e.target.value)}>
                <option value="CONTACT">Contact for price</option>
                <option value="PER_PERSON">Per person</option>
                <option value="FIXED">Fixed price</option>
                <option value="VEHICLE_BASED">Vehicle based</option>
              </Select>
            </div>
            <div><Label>Price (₹) / Per person (₹)</Label>
              <div className="flex gap-2">
                <Input type="number" value={editing.price} onChange={(e) => set("price", e.target.value)} placeholder="Fixed" />
                <Input type="number" value={editing.perPersonPrice} onChange={(e) => set("perPersonPrice", e.target.value)} placeholder="Per person" />
              </div>
            </div>
            <div><Label>Published</Label>
              <Select value={editing.active} onChange={(e) => set("active", e.target.value)}>
                <option value="true">Published</option><option value="false">Unpublished</option>
              </Select>
            </div>
            <div><Label>Featured</Label>
              <Select value={editing.featured} onChange={(e) => set("featured", e.target.value)}>
                <option value="false">No</option><option value="true">Yes</option>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Label>Vehicle options</Label>
              <div className="flex flex-wrap gap-2">
                {vehicles.map((v) => (
                  <label key={v.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
                    <input type="checkbox" checked={selVehicles.includes(v.id)}
                      onChange={(e) => setSelVehicles((c) => (e.target.checked ? [...c, v.id] : c.filter((x) => x !== v.id)))} />
                    {v.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-1">
              <Label>Places covered (one per line)</Label>
              <Textarea value={editing.placesCovered} onChange={(e) => set("placesCovered", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Itinerary (one per line)</Label>
              <Textarea value={editing.itinerary} onChange={(e) => set("itinerary", e.target.value)} />
            </div>
            <div className="sm:col-span-3">
              <Label>Description</Label>
              <Textarea value={editing.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="sm:col-span-3">
              <Label>Image URLs (one per line)</Label>
              <Textarea value={editing.images} onChange={(e) => set("images", e.target.value)} className="min-h-[60px]" placeholder="/images/dest-hills.jpg" />
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5 flex gap-2">
            <Button onClick={save} disabled={busy}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Package"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <div key={p.id} className="card overflow-hidden">
            {p.images[0] && <img src={p.images[0].url} alt={p.name} className="h-32 w-full object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <p className="font-bold text-navy-900">{p.name}</p>
                {p.featured && <Badge tone="gold">Featured</Badge>}
              </div>
              <p className="text-sm text-slate-500">{p.destination} · {p.durationDays} days</p>
              <p className="mt-1 text-sm font-semibold text-navy-800">
                {packagePriceLabel({
                  pricingType: p.pricingType as any,
                  price: p.price,
                  perPersonPrice: p.perPersonPrice,
                } as any)}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone={p.active ? "green" : "slate"}>{p.active ? "Published" : "Unpublished"}</Badge>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(p)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><PenLine className="h-4 w-4" /></button>
                  <button onClick={async () => { if (confirm(`Delete ${p.name}?`)) await deletePackage(p.id); }} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
