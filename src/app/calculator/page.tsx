"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateTripEstimates } from "@/actions/trip-actions";
import type { EstimateResponse, VehicleEstimate } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";
import { VEHICLE_TYPE_LABELS } from "@/lib/constants";
import { Input, Label, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { PriceDisclaimer } from "@/components/shared/price-disclaimer";
import { CITIES } from "@/lib/cities";
import {
  Route,
  MapPinned,
  Users,
  Loader2,
  ChevronDown,
  Check,
  AlertCircle,
  Snowflake,
  Route as RouteIcon,
} from "@/components/ui/icons";

const CITY_NAMES = CITIES.map((c) => c.name);

export default function CalculatorPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [pickup, setPickup] = React.useState(params.get("pickup") || "Shivamogga");
  const [destination, setDestination] = React.useState(params.get("destination") || "");
  const [travelDate, setTravelDate] = React.useState(params.get("travelDate") || "");
  const [returnDate, setReturnDate] = React.useState(params.get("returnDate") || "");
  const [tripType, setTripType] = React.useState<"ONEWAY" | "ROUNDTRIP">(
    (params.get("tripType") as "ONEWAY" | "ROUNDTRIP") || "ROUNDTRIP",
  );
  const [passengers, setPassengers] = React.useState(params.get("passengers") || "10");
  const [manualDistance, setManualDistance] = React.useState("");
  const [showManual, setShowManual] = React.useState(false);

  const [result, setResult] = React.useState<EstimateResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await calculateTripEstimates({
        pickup,
        destination,
        travelDate,
        returnDate: tripType === "ROUNDTRIP" ? returnDate : null,
        tripType,
        passengers: Number(passengers) || 1,
        manualDistanceKm: manualDistance ? Number(manualDistance) : null,
      });
      if (res.ok) {
        setResult(res);
        if (res.estimates && res.estimates.length > 0) {
          setTimeout(
            () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }),
            100,
          );
        }
      } else {
        setError(res.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("We couldn't calculate the road distance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectVehicle = (v: VehicleEstimate) => {
    const q = new URLSearchParams({
      vehicle: v.slug,
      pickup,
      destination,
      travelDate,
      tripType,
      passengers: String(passengers),
      distance: String(result?.oneWayDistanceKm ?? 0),
    });
    if (tripType === "ROUNDTRIP" && returnDate) q.set("returnDate", returnDate);
    router.push(`/book?${q.toString()}`);
  };

  const bestValueId =
    result?.estimates
      ?.filter((e) => e.available)
      .sort((a, b) => a.estimate.total - b.estimate.total)[0]?.id ?? null;

  return (
    <div className="bg-slate-100">
      <PageHeader
        eyebrow="Price Calculator"
        title="Trip Price Calculator"
        subtitle="Estimate your trip fare by distance. Compare all our vehicles side by side and pick the one that suits your group."
        compact
      />

      <div className="container-px py-10">
        {/* form */}
        <form onSubmit={run} className="card p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label>Pickup location</Label>
              <div className="relative">
                <MapPinned className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  list="city-list"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. Shivamogga"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Destination</Label>
              <Input
                list="city-list"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Bengaluru"
              />
            </div>
            <div>
              <Label>Number of passengers</Label>
              <Input
                type="number"
                min={1}
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
              />
            </div>
            <div>
              <Label>Trip type</Label>
              <Select
                value={tripType}
                onChange={(e) => setTripType(e.target.value as "ONEWAY" | "ROUNDTRIP")}
              >
                <option value="ROUNDTRIP">Round Trip</option>
                <option value="ONEWAY">One Way</option>
              </Select>
            </div>
            <div>
              <Label>Travel date</Label>
              <Input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
            </div>
            {tripType === "ROUNDTRIP" && (
              <div>
                <Label>Return date</Label>
                <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowManual((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-navy-700 hover:underline"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showManual ? "rotate-180" : ""}`} />
              Enter distance manually (optional)
            </button>
            {showManual && (
              <div className="mt-2 max-w-xs">
                <Label>Estimated distance (km)</Label>
                <Input
                  type="number"
                  min={1}
                  value={manualDistance}
                  onChange={(e) => setManualDistance(e.target.value)}
                  placeholder="e.g. 280"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <div className="mt-5">
            <Button type="submit" variant="gold" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Calculating…
                </>
              ) : (
                <>Calculate Estimated Price</>
              )}
            </Button>
          </div>
        </form>

        {/* results */}
        {result?.ok && result.estimates && (
          <div id="results" className="mt-10">
            <div className="relative mb-6 overflow-hidden rounded-2xl bg-navy-gradient p-5 text-white sm:p-6">
              <div aria-hidden className="absolute inset-0 bg-radial-gold" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-300">Estimated trip</p>
                  <p className="font-display text-lg font-bold text-white">
                    {pickup} → {destination}
                  </p>
                  <p className="text-sm text-slate-300">
                    {formatDate(travelDate)}
                    {tripType === "ROUNDTRIP" && returnDate && ` — ${formatDate(returnDate)}`} ·{" "}
                    {passengers} passengers
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-slate-300">Estimated distance</p>
                  <p className="font-display text-3xl font-extrabold text-gold-400">
                    {result.totalDistanceKm?.toLocaleString("en-IN")} km
                  </p>
                  <p className="text-xs text-slate-400">
                    {result.source === "routing"
                      ? "Road distance from maps"
                      : "Estimated road distance"}{" "}
                    ({tripType === "ROUNDTRIP" ? "round trip" : "one way"})
                  </p>
                </div>
              </div>
            </div>

            <PriceDisclaimer className="mb-6" />

            {/* desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft-lg lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-gradient text-left text-white">
                    <th className="px-4 py-3.5 font-semibold">Vehicle</th>
                    <th className="px-4 py-3.5 font-semibold">Capacity</th>
                    <th className="px-4 py-3.5 font-semibold">Price / KM</th>
                    <th className="px-4 py-3.5 font-semibold">Estimated Price</th>
                    <th className="px-4 py-3.5 font-semibold">Availability</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.estimates.map((v) => (
                    <ResultRow
                      key={v.id}
                      v={v}
                      best={v.id === bestValueId}
                      onSelect={() => selectVehicle(v)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {result.estimates.map((v) => (
                <ResultCard
                  key={v.id}
                  v={v}
                  best={v.id === bestValueId}
                  onSelect={() => selectVehicle(v)}
                />
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Demo rates shown may be placeholder values configured for demonstration — final rates are
              confirmed by Balaji Holidays.
            </p>
          </div>
        )}
      </div>

      <datalist id="city-list">
        {CITY_NAMES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}

function ResultRow({
  v,
  best,
  onSelect,
}: {
  v: VehicleEstimate;
  best: boolean;
  onSelect: () => void;
}) {
  return (
    <tr className={best ? "bg-gold-50/60" : undefined}>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {v.imageUrl ? (
            <img src={v.imageUrl} alt={v.name} className="h-12 w-16 rounded-md object-cover" />
          ) : (
            <div className="h-12 w-16 rounded-md bg-slate-200" />
          )}
          <div>
            <p className="font-bold text-navy-900">{v.name}</p>
            <p className="text-xs text-slate-500">
              {VEHICLE_TYPE_LABELS[v.type]} {v.ac ? "· AC" : "· Non-AC"}
            </p>
            {best && (
              <Badge tone="gold" className="mt-1">
                ★ Best Value
              </Badge>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4 text-slate-400" /> {v.capacity}
        </span>
      </td>
      <td className="px-4 py-4">
        {v.showPricePerKm ? formatINR(v.pricePerKm) : <span className="text-slate-400">On request</span>}
      </td>
      <td className="px-4 py-4 text-lg font-extrabold text-navy-900">
        {formatINR(v.estimate.total)}
      </td>
      <td className="px-4 py-4">
        {v.available ? (
          <Badge tone="green">Available</Badge>
        ) : (
          <span className="text-xs font-medium text-red-600">{v.unavailableReason}</span>
        )}
      </td>
      <td className="px-4 py-4">
        <Button size="sm" variant={best ? "gold" : "outline"} onClick={onSelect} disabled={!v.available}>
          Select Vehicle
        </Button>
      </td>
    </tr>
  );
}

function ResultCard({
  v,
  best,
  onSelect,
}: {
  v: VehicleEstimate;
  best: boolean;
  onSelect: () => void;
}) {
  return (
    <div className={`card overflow-hidden ${best ? "ring-2 ring-gold-400" : ""}`}>
      <div className="relative h-36 bg-slate-200">
        {v.imageUrl && <img src={v.imageUrl} alt={v.name} className="h-full w-full object-cover" />}
        {best && (
          <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-bold text-navy-950">
            ★ Best Value
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-navy-900">{v.name}</h3>
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <Users className="h-4 w-4" /> {v.capacity}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          {VEHICLE_TYPE_LABELS[v.type]} {v.ac ? "· AC" : "· Non-AC"}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">Estimated price</p>
            <p className="text-xl font-extrabold text-navy-900">{formatINR(v.estimate.total)}</p>
            <p className="text-xs text-slate-400">
              {v.showPricePerKm ? `${formatINR(v.pricePerKm)}/km` : "Rate on request"}
            </p>
          </div>
          {v.available ? (
            <Badge tone="green">Available</Badge>
          ) : (
            <span className="max-w-[140px] text-right text-xs font-medium text-red-600">
              {v.unavailableReason}
            </span>
          )}
        </div>
        <Button
          className="mt-4 w-full"
          variant={best ? "gold" : "outline"}
          onClick={onSelect}
          disabled={!v.available}
        >
          Select Vehicle
        </Button>
      </div>
    </div>
  );
}
