"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { calculateTripEstimates } from "@/actions/trip-actions";
import { formatINR, formatDate } from "@/lib/utils";
import { Input, Label, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PriceDisclaimer } from "@/components/shared/price-disclaimer";
import { Loader2, Info } from "@/components/ui/icons";

export function VehiclePriceCalculator({
  vehicleId,
  vehicleSlug,
  vehicleName,
}: {
  vehicleId: string;
  vehicleSlug: string;
  vehicleName: string;
}) {
  const router = useRouter();
  const [pickup, setPickup] = React.useState("Shivamogga");
  const [destination, setDestination] = React.useState("");
  const [travelDate, setTravelDate] = React.useState("");
  const [returnDate, setReturnDate] = React.useState("");
  const [tripType, setTripType] = React.useState<"ONEWAY" | "ROUNDTRIP">("ROUNDTRIP");
  const [passengers, setPassengers] = React.useState("6");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [estimate, setEstimate] = React.useState<any>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setEstimate(null);
    try {
      const res = await calculateTripEstimates({
        pickup,
        destination,
        travelDate,
        returnDate: tripType === "ROUNDTRIP" ? returnDate : null,
        tripType,
        passengers: Number(passengers) || 1,
      });
      if (!res.ok) {
        setError(res.error || "We couldn't calculate the road distance. Please try again.");
        return;
      }
      const mine = res.estimates?.find((v) => v.id === vehicleId);
      if (!mine) {
        setError("This vehicle is unavailable for the selected dates.");
        return;
      }
      setEstimate({ distance: res.totalDistanceKm, oneWay: res.oneWayDistanceKm, v: mine });
    } catch {
      setError("We couldn't calculate the road distance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const book = () => {
    const q = new URLSearchParams({
      vehicle: vehicleSlug,
      pickup,
      destination,
      travelDate,
      tripType,
      passengers,
      distance: String(estimate?.oneWay ?? 0),
    });
    if (tripType === "ROUNDTRIP" && returnDate) q.set("returnDate", returnDate);
    router.push(`/book?${q.toString()}`);
  };

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold text-navy-900">Estimate price for {vehicleName}</h3>
      <form onSubmit={run} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Pickup location</Label>
          <Input value={pickup} onChange={(e) => setPickup(e.target.value)} />
        </div>
        <div>
          <Label>Destination</Label>
          <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Bengaluru" />
        </div>
        <div>
          <Label>Trip type</Label>
          <Select value={tripType} onChange={(e) => setTripType(e.target.value as any)}>
            <option value="ROUNDTRIP">Round Trip</option>
            <option value="ONEWAY">One Way</option>
          </Select>
        </div>
        <div>
          <Label>Passengers</Label>
          <Input type="number" min={1} value={passengers} onChange={(e) => setPassengers(e.target.value)} />
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
        <div className="sm:col-span-2">
          <Button type="submit" variant="gold" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Calculating…
              </>
            ) : (
              "Get Estimated Price"
            )}
          </Button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      {estimate && (
        <div className="mt-5 space-y-4">
          <div className="relative overflow-hidden rounded-xl bg-navy-gradient p-4 text-white">
            <div aria-hidden className="absolute inset-0 bg-radial-gold" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300">Estimated distance</p>
                <p className="font-display text-xl font-bold">{estimate.distance?.toLocaleString("en-IN")} km</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300">Estimated price</p>
                <p className="font-display text-2xl font-extrabold text-gold-400">
                  {formatINR(estimate.v.estimate.total)}
                </p>
              </div>
            </div>
          </div>

          {estimate.v.estimate.lines.map((l: any) => (
            <div key={l.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{l.label}</span>
              <span className="font-medium text-navy-900">{formatINR(l.amount)}</span>
            </div>
          ))}

          {estimate.v.estimate.billableKm !== estimate.v.estimate.actualDistanceKm && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p>Actual distance: {estimate.v.estimate.actualDistanceKm} km</p>
              {estimate.v.estimate.minBillingKm > 0 && (
                <p>Minimum billing distance: {estimate.v.estimate.minBillingKm} km</p>
              )}
              <p className="font-semibold text-navy-800">
                Billable distance: {estimate.v.estimate.billableKm} km
              </p>
            </div>
          )}

          <PriceDisclaimer />
          <Button onClick={book} variant="gold" className="w-full sm:w-auto" disabled={!estimate.v.available}>
            Book {vehicleName} →
          </Button>
        </div>
      )}
    </div>
  );
}
