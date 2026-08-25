"use client";

import * as React from "react";
import { saveDriver, deleteDriver } from "@/actions/admin-actions";
import { parseJSON } from "@/lib/utils";
import { Input, Label, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, PenLine, Loader2, X, Star } from "@/components/ui/icons";

type DriverRow = {
  id: string;
  name: string;
  phone: string | null;
  photoUrl: string | null;
  experienceYears: number;
  languages: string;
  bio: string | null;
  rating: number;
  active: boolean;
  available: boolean;
};

type VehicleOpt = { id: string; name: string };

const empty = {
  id: "",
  name: "",
  phone: "",
  photoUrl: "",
  experienceYears: "",
  languages: "",
  bio: "",
  rating: "4.5",
  active: "true",
  available: "true",
};

export function DriverManager({
  drivers,
  vehicles,
  vehicleIdsByDriver,
}: {
  drivers: DriverRow[];
  vehicles: VehicleOpt[];
  vehicleIdsByDriver: Record<string, string[]>;
}) {
  const [editing, setEditing] = React.useState<Record<string, string> | null>(null);
  const [selVehicles, setSelVehicles] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const set = (k: string, v: string) => setEditing((f) => (f ? { ...f, [k]: v } : f));

  const startEdit = (d: DriverRow) => {
    setEditing({
      ...empty,
      id: d.id,
      name: d.name,
      phone: d.phone || "",
      photoUrl: d.photoUrl || "",
      experienceYears: String(d.experienceYears),
      languages: parseJSON<string[]>(d.languages, []).join("\n"),
      bio: d.bio || "",
      rating: String(d.rating),
      active: String(d.active),
      available: String(d.available),
    });
    setSelVehicles(vehicleIdsByDriver[d.id] || []);
    setError("");
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    const res = await saveDriver({ ...editing, vehicleIds: selVehicles }, editing.id || undefined);
    setBusy(false);
    if (!res.ok) return setError(res.error || "Error");
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Driver Management</h1>
        <Button variant="gold" onClick={() => { setEditing({ ...empty }); setSelVehicles([]); setError(""); }}>
          <Plus className="h-4 w-4" /> Add Driver
        </Button>
      </div>

      {editing && (
        <div className="card mt-6 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">{editing.id ? "Edit Driver" : "Add Driver"}</h2>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><Label>Name *</Label><Input value={editing.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={editing.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><Label>Photo URL</Label><Input value={editing.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} /></div>
            <div><Label>Experience (years)</Label><Input type="number" value={editing.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} /></div>
            <div><Label>Rating</Label><Input type="number" step="0.1" value={editing.rating} onChange={(e) => set("rating", e.target.value)} /></div>
            <div><Label>Active</Label>
              <Select value={editing.active} onChange={(e) => set("active", e.target.value)}>
                <option value="true">Active</option><option value="false">Inactive</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Languages (one per line)</Label>
              <Textarea value={editing.languages} onChange={(e) => set("languages", e.target.value)} className="min-h-[60px]" />
            </div>
            <div>
              <Label>Available</Label>
              <Select value={editing.available} onChange={(e) => set("available", e.target.value)}>
                <option value="true">Available</option><option value="false">Not available</option>
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Label>Bio</Label>
              <Textarea value={editing.bio} onChange={(e) => set("bio", e.target.value)} />
            </div>
            <div className="sm:col-span-3">
              <Label>Assigned vehicles</Label>
              <div className="flex flex-wrap gap-2">
                {vehicles.map((v) => (
                  <label key={v.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={selVehicles.includes(v.id)}
                      onChange={(e) => {
                        setSelVehicles((cur) =>
                          e.target.checked ? [...cur, v.id] : cur.filter((x) => x !== v.id),
                        );
                      }}
                    />
                    {v.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5 flex gap-2">
            <Button onClick={save} disabled={busy}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Driver"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map((d) => (
          <div key={d.id} className="card p-4">
            <div className="flex items-start gap-3">
              {d.photoUrl ? (
                <img src={d.photoUrl} alt={d.name} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-lg font-bold text-white">
                  {d.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-navy-900">{d.name}</p>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-gold-600">
                    <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" /> {d.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{d.experienceYears} yrs · {parseJSON<string[]>(d.languages, []).join(", ")}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-1">
                <Badge tone={d.active ? "green" : "slate"}>{d.active ? "Active" : "Inactive"}</Badge>
                <Badge tone={d.available ? "blue" : "amber"}>{d.available ? "Available" : "Busy"}</Badge>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(d)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100">
                  <PenLine className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => { if (confirm(`Delete ${d.name}?`)) await deleteDriver(d.id); }}
                  className="rounded p-1.5 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
