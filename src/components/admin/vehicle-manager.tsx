"use client";

import * as React from "react";
import { saveVehicle, deleteVehicle, setVehicleActive, setVehicleStatus } from "@/actions/admin-actions";
import { formatINR, parseJSON } from "@/lib/utils";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VEHICLE_STATUS_LABELS } from "@/lib/constants";
import { Plus, Trash2, PenLine, Loader2, X } from "@/components/ui/icons";

type VehicleRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  capacity: number;
  ac: boolean;
  status: string;
  active: boolean;
  showPricePerKm: boolean;
  description: string | null;
  features: string;
  images: { url: string }[];
  pricing: {
    pricePerKm: number;
    minBillingKm: number;
    minKmPerDay: number;
  } | null;
};

const emptyForm = {
  id: "",
  name: "",
  type: "BUS",
  capacity: "",
  ac: "true",
  status: "AVAILABLE",
  showPricePerKm: "true",
  description: "",
  features: "",
  images: "",
  pricePerKm: "",
  minBillingKm: "",
  minKmPerDay: "",
  driverAllowancePerDay: "",
  driverAllowanceEnabled: "false",
  tollEnabled: "false",
  tollCharge: "",
  parkingEnabled: "false",
  parkingCharge: "",
  permitEnabled: "false",
  permitCharge: "",
  nightEnabled: "false",
  nightCharge: "",
  waitingEnabled: "false",
  waitingChargePerHour: "",
  fixedEnabled: "false",
  fixedCharge: "",
  seasonalEnabled: "false",
  seasonalChargePct: "",
};

export function VehicleManager({ vehicles }: { vehicles: VehicleRow[] }) {
  const [editing, setEditing] = React.useState<Record<string, string> | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const startEdit = (v: VehicleRow) => {
    const p = v.pricing;
    setEditing({
      ...emptyForm,
      id: v.id,
      name: v.name,
      type: v.type,
      capacity: String(v.capacity),
      ac: String(v.ac),
      status: v.status,
      showPricePerKm: String(v.showPricePerKm),
      description: v.description || "",
      features: parseJSON<string[]>(v.features, []).join("\n"),
      images: v.images.map((i) => i.url).join("\n"),
      pricePerKm: p ? String(p.pricePerKm) : "",
      minBillingKm: p ? String(p.minBillingKm) : "",
      minKmPerDay: p ? String(p.minKmPerDay) : "",
    });
    setError("");
  };

  const set = (k: string, val: string) => setEditing((f) => (f ? { ...f, [k]: val } : f));

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setError("");
    const res = await saveVehicle(editing, editing.id || undefined);
    setBusy(false);
    if (!res.ok) return setError(res.error || "Error");
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Vehicle Management</h1>
        <Button
          variant="gold"
          onClick={() => {
            setEditing({ ...emptyForm });
            setError("");
          }}
        >
          <Plus className="h-4 w-4" /> Add Vehicle
        </Button>
      </div>
      <p className="text-sm text-slate-500">Add, edit and manage your fleet. Changes appear on the website instantly.</p>

      {editing && (
        <div className="card mt-6 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">{editing.id ? "Edit Vehicle" : "Add Vehicle"}</h2>
            <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label>Vehicle name *</Label>
              <Input value={editing.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. 32-Seater Bus" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={editing.type} onChange={(e) => set("type", e.target.value)}>
                <option value="BUS">Bus</option>
                <option value="MINI_BUS">Mini Bus</option>
                <option value="TEMPO_TRAVELLER">Tempo Traveller</option>
                <option value="INNOVA">Innova</option>
                <option value="CAR">Car</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
            <div>
              <Label>Seating capacity *</Label>
              <Input type="number" value={editing.capacity} onChange={(e) => set("capacity", e.target.value)} />
            </div>
            <div>
              <Label>AC / Non-AC</Label>
              <Select value={editing.ac} onChange={(e) => set("ac", e.target.value)}>
                <option value="true">AC</option>
                <option value="false">Non-AC</option>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editing.status} onChange={(e) => set("status", e.target.value)}>
                <option value="AVAILABLE">Available</option>
                <option value="BOOKED">Booked</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </Select>
            </div>
            <div>
              <Label>Show price per km to customers</Label>
              <Select value={editing.showPricePerKm} onChange={(e) => set("showPricePerKm", e.target.value)}>
                <option value="true">Yes</option>
                <option value="false">No (estimate only)</option>
              </Select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Description</Label>
              <Textarea value={editing.description} onChange={(e) => set("description", e.target.value)} className="min-h-[80px]" />
            </div>
            <div>
              <Label>Features (one per line)</Label>
              <Textarea value={editing.features} onChange={(e) => set("features", e.target.value)} className="min-h-[80px]" placeholder="AC&#10;Push-back seats" />
            </div>
          </div>

          <div className="mt-4">
            <Label>Image URLs (one per line) — use /images/*.jpg for bundled images or a hosted URL</Label>
            <Textarea value={editing.images} onChange={(e) => set("images", e.target.value)} className="min-h-[70px]" placeholder="/images/bus-50.png" />
          </div>

          {/* pricing */}
          <h3 className="mt-6 font-bold text-navy-900">Pricing (demo values — set real rates)</h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Price per km (₹) *</Label>
              <Input type="number" value={editing.pricePerKm} onChange={(e) => set("pricePerKm", e.target.value)} />
            </div>
            <div>
              <Label>Minimum billing km</Label>
              <Input type="number" value={editing.minBillingKm} onChange={(e) => set("minBillingKm", e.target.value)} />
            </div>
            <div>
              <Label>Minimum km per day</Label>
              <Input type="number" value={editing.minKmPerDay} onChange={(e) => set("minKmPerDay", e.target.value)} />
            </div>
          </div>

          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <ChargeRow label="Driver allowance (per day)" enabled={editing.driverAllowanceEnabled} amount={editing.driverAllowancePerDay}
              onEnabled={(v) => set("driverAllowanceEnabled", v)} onAmount={(v) => set("driverAllowancePerDay", v)} />
            <ChargeRow label="Toll charges" enabled={editing.tollEnabled} amount={editing.tollCharge}
              onEnabled={(v) => set("tollEnabled", v)} onAmount={(v) => set("tollCharge", v)} />
            <ChargeRow label="Parking charges" enabled={editing.parkingEnabled} amount={editing.parkingCharge}
              onEnabled={(v) => set("parkingEnabled", v)} onAmount={(v) => set("parkingCharge", v)} />
            <ChargeRow label="Permit charges" enabled={editing.permitEnabled} amount={editing.permitCharge}
              onEnabled={(v) => set("permitEnabled", v)} onAmount={(v) => set("permitCharge", v)} />
            <ChargeRow label="Night charge (per night)" enabled={editing.nightEnabled} amount={editing.nightCharge}
              onEnabled={(v) => set("nightEnabled", v)} onAmount={(v) => set("nightCharge", v)} />
            <ChargeRow label="Waiting charge (per hour)" enabled={editing.waitingEnabled} amount={editing.waitingChargePerHour}
              onEnabled={(v) => set("waitingEnabled", v)} onAmount={(v) => set("waitingChargePerHour", v)} />
            <ChargeRow label="Additional fixed charge" enabled={editing.fixedEnabled} amount={editing.fixedCharge}
              onEnabled={(v) => set("fixedEnabled", v)} onAmount={(v) => set("fixedCharge", v)} />
            <ChargeRow label="Seasonal charge (%)" enabled={editing.seasonalEnabled} amount={editing.seasonalChargePct}
              onEnabled={(v) => set("seasonalEnabled", v)} onAmount={(v) => set("seasonalChargePct", v)} />
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="mt-5 flex gap-2">
            <Button onClick={save} disabled={busy}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Vehicle"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* list */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <th className="px-4 py-3 font-semibold">Vehicle</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Capacity</th>
              <th className="px-4 py-3 font-semibold">Price/km</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Active</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-3 font-semibold text-navy-900">{v.name}</td>
                <td className="px-4 py-3 capitalize">{v.type.replace(/_/g, " ").toLowerCase()}</td>
                <td className="px-4 py-3">{v.capacity}</td>
                <td className="px-4 py-3">{v.pricing ? formatINR(v.pricing.pricePerKm) : "—"}</td>
                <td className="px-4 py-3">
                  <select
                    value={v.status}
                    onChange={async (e) => {
                      await setVehicleStatus(v.id, e.target.value);
                    }}
                    className="rounded border border-slate-200 px-2 py-1 text-xs"
                  >
                    {Object.entries(VEHICLE_STATUS_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={async () => {
                      await setVehicleActive(v.id, !v.active);
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${v.active ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${v.active ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => startEdit(v)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100" title="Edit">
                      <PenLine className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete ${v.name}?`)) await deleteVehicle(v.id);
                      }}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChargeRow({
  label,
  enabled,
  amount,
  onEnabled,
  onAmount,
}: {
  label: string;
  enabled: string;
  amount: string;
  onEnabled: (v: string) => void;
  onAmount: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex w-56 items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={enabled === "true"}
          onChange={(e) => onEnabled(e.target.checked ? "true" : "false")}
          className="h-4 w-4 rounded border-slate-300"
        />
        {label}
      </label>
      <Input
        type="number"
        value={amount}
        onChange={(e) => onAmount(e.target.value)}
        placeholder="Amount (₹)"
        className="w-36"
        disabled={enabled !== "true"}
      />
    </div>
  );
}
