"use client";

import * as React from "react";
import { savePricing } from "@/actions/admin-actions";
import { formatINR } from "@/lib/utils";
import { Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "@/components/ui/icons";

type PricingRow = {
  id: string;
  name: string;
  capacity: number;
  p: {
    pricePerKm: number;
    minBillingKm: number;
    minKmPerDay: number;
    driverAllowancePerDay: number;
    driverAllowanceEnabled: boolean;
    tollEnabled: boolean;
    tollCharge: number;
    parkingEnabled: boolean;
    parkingCharge: number;
    permitEnabled: boolean;
    permitCharge: number;
    nightEnabled: boolean;
    nightCharge: number;
    waitingEnabled: boolean;
    waitingChargePerHour: number;
    fixedEnabled: boolean;
    fixedCharge: number;
    seasonalEnabled: boolean;
    seasonalChargePct: number;
  };
};

export function PricingManager({ rows }: { rows: PricingRow[] }) {
  const [state, setState] = React.useState<Record<string, Record<string, string | boolean>>>({});
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [savedId, setSavedId] = React.useState<string | null>(null);

  const get = (id: string, key: string): string | boolean => {
    if (state[id] && state[id][key] !== undefined) return state[id][key];
    const row = rows.find((r) => r.id === id);
    if (!row) return "";
    const val = (row.p as any)[key];
    return val ?? "";
  };

  const set = (id: string, key: string, val: string | boolean) =>
    setState((s) => ({ ...s, [id]: { ...s[id], [key]: val } }));

  const save = async (id: string) => {
    setBusyId(id);
    const row = rows.find((r) => r.id === id)!;
    const payload: Record<string, unknown> = {};
    const keys: (keyof PricingRow["p"])[] = [
      "pricePerKm",
      "minBillingKm",
      "minKmPerDay",
      "driverAllowancePerDay",
      "driverAllowanceEnabled",
      "tollEnabled",
      "tollCharge",
      "parkingEnabled",
      "parkingCharge",
      "permitEnabled",
      "permitCharge",
      "nightEnabled",
      "nightCharge",
      "waitingEnabled",
      "waitingChargePerHour",
      "fixedEnabled",
      "fixedCharge",
      "seasonalEnabled",
      "seasonalChargePct",
    ];
    for (const k of keys) {
      const v = get(id, k as string);
      payload[k as string] = v === "" ? row.p[k] : v;
    }
    await savePricing(id, payload);
    setBusyId(null);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 1500);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Pricing Management</h1>
      <p className="text-sm text-slate-500">
        Configure price per km and optional charges for each vehicle. Changes take effect immediately
        on new price calculations.
      </p>

      <div className="mt-6 space-y-6">
        {rows.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-navy-900">{r.name}</h2>
                <p className="text-xs text-slate-500">{r.capacity} seats</p>
              </div>
              <Button size="sm" onClick={() => save(r.id)} disabled={busyId === r.id}>
                {busyId === r.id ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                ) : savedId === r.id ? (
                  <><Check className="h-4 w-4" /> Saved</>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label>Price per km (₹)</Label>
                <Input type="number" value={String(get(r.id, "pricePerKm"))} onChange={(e) => set(r.id, "pricePerKm", e.target.value)} />
              </div>
              <div>
                <Label>Minimum billing km</Label>
                <Input type="number" value={String(get(r.id, "minBillingKm"))} onChange={(e) => set(r.id, "minBillingKm", e.target.value)} />
              </div>
              <div>
                <Label>Minimum km per day</Label>
                <Input type="number" value={String(get(r.id, "minKmPerDay"))} onChange={(e) => set(r.id, "minKmPerDay", e.target.value)} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              <Charge label="Driver allowance /day" enabledKey="driverAllowanceEnabled" amountKey="driverAllowancePerDay" r={r} get={get} set={set} />
              <Charge label="Toll" enabledKey="tollEnabled" amountKey="tollCharge" r={r} get={get} set={set} />
              <Charge label="Parking" enabledKey="parkingEnabled" amountKey="parkingCharge" r={r} get={get} set={set} />
              <Charge label="Permit" enabledKey="permitEnabled" amountKey="permitCharge" r={r} get={get} set={set} />
              <Charge label="Night charge /night" enabledKey="nightEnabled" amountKey="nightCharge" r={r} get={get} set={set} />
              <Charge label="Waiting /hour" enabledKey="waitingEnabled" amountKey="waitingChargePerHour" r={r} get={get} set={set} />
              <Charge label="Fixed charge" enabledKey="fixedEnabled" amountKey="fixedCharge" r={r} get={get} set={set} />
              <Charge label="Seasonal (%)" enabledKey="seasonalEnabled" amountKey="seasonalChargePct" r={r} get={get} set={set} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Charge({
  label,
  enabledKey,
  amountKey,
  r,
  get,
  set,
}: {
  label: string;
  enabledKey: string;
  amountKey: string;
  r: PricingRow;
  get: (id: string, key: string) => string | boolean;
  set: (id: string, key: string, val: string | boolean) => void;
}) {
  const enabled = get(r.id, enabledKey) === true || get(r.id, enabledKey) === "true";
  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => set(r.id, enabledKey, e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        {label}
      </label>
      <Input
        type="number"
        value={String(get(r.id, amountKey))}
        onChange={(e) => set(r.id, amountKey, e.target.value)}
        disabled={!enabled}
        className="w-24"
        placeholder="₹"
      />
    </div>
  );
}
