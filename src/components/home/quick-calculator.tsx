"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Input, Label, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CITIES } from "@/lib/cities";
import { MapPinned, Route, ArrowRight } from "@/components/ui/icons";

const CITY_NAMES = CITIES.map((c) => c.name);

export function HeroEstimateCard() {
  const router = useRouter();
  const [pickup, setPickup] = React.useState("Shivamogga");
  const [destination, setDestination] = React.useState("");
  const [travelDate, setTravelDate] = React.useState("");
  const [returnDate, setReturnDate] = React.useState("");
  const [tripType, setTripType] = React.useState<"ONEWAY" | "ROUNDTRIP">("ROUNDTRIP");
  const [passengers, setPassengers] = React.useState("10");
  const [error, setError] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !destination.trim()) {
      setError("Please enter pickup and destination.");
      return;
    }
    if (!travelDate) {
      setError("Please select a travel date.");
      return;
    }
    setError("");
    const params = new URLSearchParams({
      pickup,
      destination,
      travelDate,
      tripType,
      passengers,
    });
    if (tripType === "ROUNDTRIP" && returnDate) params.set("returnDate", returnDate);
    router.push(`/calculator?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className="relative rounded-2xl border border-white/15 bg-white/[0.06] p-5 shadow-soft-lg backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.08] sm:p-6"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" />

      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient text-navy-950 shadow-gold">
          <Route className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-white">Get a quick estimate</h3>
          <p className="text-xs text-slate-400">Compare fares across our fleet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div>
          <Label className="label-dark">Pickup location</Label>
          <div className="relative">
            <MapPinned className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              list="city-list"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="e.g. Shivamogga"
              className="input-dark pl-9"
            />
          </div>
        </div>
        <div>
          <Label className="label-dark">Destination</Label>
          <Input
            list="city-list"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Bengaluru"
            className="input-dark"
          />
        </div>
        <div>
          <Label className="label-dark">Trip type</Label>
          <Select
            value={tripType}
            onChange={(e) => setTripType(e.target.value as "ONEWAY" | "ROUNDTRIP")}
            className="input-dark"
          >
            <option value="ROUNDTRIP">Round Trip</option>
            <option value="ONEWAY">One Way</option>
          </Select>
        </div>
        <div>
          <Label className="label-dark">Passengers</Label>
          <Input
            type="number"
            min={1}
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            placeholder="e.g. 10"
            className="input-dark"
          />
        </div>
        <div>
          <Label className="label-dark">Travel date</Label>
          <Input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="input-dark"
          />
        </div>
        {tripType === "ROUNDTRIP" && (
          <div>
            <Label className="label-dark">Return date</Label>
            <Input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="input-dark"
            />
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-300">{error}</p>}

      <Button type="submit" variant="gold" className="btn-shine mt-4 w-full !py-3">
        Calculate Estimated Price <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        Estimated price only — final fare confirmed by Balaji Holidays.
      </p>

      <datalist id="city-list">
        {CITY_NAMES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </form>
  );
}