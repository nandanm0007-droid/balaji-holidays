"use client";

import * as React from "react";
import Link from "next/link";
import { calculateTripEstimates, getAvailableDrivers } from "@/actions/trip-actions";
import { createBooking } from "@/actions/booking-actions";
import type { EstimateResponse, DriverOption, VehicleEstimate } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";
import { VEHICLE_TYPE_LABELS } from "@/lib/constants";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisclaimer } from "@/components/shared/price-disclaimer";
import type { SiteSettings } from "@/lib/settings";
import { whatsappLink, telLink } from "@/lib/links";
import {
  Loader2,
  Check,
  Users,
  MessageCircle,
  Phone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "@/components/ui/icons";

type Step = 1 | 2 | 3 | 4;

export function BookingWizard({
  settings,
  initial,
}: {
  settings: SiteSettings;
  initial: {
    vehicle?: string;
    pickup?: string;
    destination?: string;
    travelDate?: string;
    returnDate?: string;
    tripType?: string;
    passengers?: string;
    distance?: string;
  };
}) {
  const [step, setStep] = React.useState<Step>(1);

  // step 1
  const [pickup, setPickup] = React.useState(initial.pickup || "Shivamogga");
  const [destination, setDestination] = React.useState(initial.destination || "");
  const [travelDate, setTravelDate] = React.useState(initial.travelDate || "");
  const [returnDate, setReturnDate] = React.useState(initial.returnDate || "");
  const [tripType, setTripType] = React.useState<"ONEWAY" | "ROUNDTRIP">(
    (initial.tripType as "ONEWAY" | "ROUNDTRIP") || "ROUNDTRIP",
  );
  const [passengers, setPassengers] = React.useState(initial.passengers || "10");

  // step 2
  const [result, setResult] = React.useState<EstimateResponse | null>(null);
  const [calculating, setCalculating] = React.useState(false);
  const [selectedVehicle, setSelectedVehicle] = React.useState<VehicleEstimate | null>(null);
  const [preselectSlug] = React.useState(initial.vehicle || "");
  const [drivers, setDrivers] = React.useState<DriverOption[]>([]);
  const [selectedDriver, setSelectedDriver] = React.useState("");

  // step 3
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  // step 5
  const [confirmation, setConfirmation] = React.useState<any>(null);

  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);

  // ── Step 1 → 2: calculate estimates ──
  const goToVehicles = async () => {
    if (!pickup.trim() || !destination.trim()) {
      setError("Please enter pickup location and destination.");
      return;
    }
    if (!travelDate) {
      setError("Please select a travel date.");
      return;
    }
    setError("");
    setCalculating(true);
    const res = await calculateTripEstimates({
      pickup,
      destination,
      travelDate,
      returnDate: tripType === "ROUNDTRIP" ? returnDate : null,
      tripType,
      passengers: Number(passengers) || 1,
    });
    setCalculating(false);
    if (!res.ok) {
      setError(res.error || "We couldn't calculate the road distance. Please try again.");
      return;
    }
    setResult(res);
    if (preselectSlug) {
      const pre = res.estimates?.find((v) => v.slug === preselectSlug);
      if (pre && pre.available) {
        setSelectedVehicle(pre);
        loadDrivers(pre.id);
      }
    }
    setStep(2);
  };

  const loadDrivers = async (vehicleId: string) => {
    const ds = await getAvailableDrivers(travelDate, tripType === "ROUNDTRIP" ? returnDate : null, vehicleId);
    setDrivers(ds);
  };

  const selectVehicle = (v: VehicleEstimate) => {
    if (!v.available) return;
    setSelectedVehicle(v);
    setSelectedDriver("");
    loadDrivers(v.id);
  };

  // ── Submit ──
  const submitBooking = async () => {
    if (!selectedVehicle) return;
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await createBooking({
      vehicleId: selectedVehicle.id,
      driverId: selectedDriver || null,
      pickup,
      destination,
      travelDate,
      returnDate: tripType === "ROUNDTRIP" ? returnDate : null,
      tripType,
      passengers: Number(passengers) || 1,
      oneWayDistanceKm: result?.oneWayDistanceKm ?? 0,
      customerName: name,
      customerPhone: phone.trim(),
      customerEmail: email,
      customerNotes: notes,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "Could not submit booking. Please try again.");
      setStep(3);
      return;
    }
    setConfirmation(res.booking);
    setStep(4);
  };

  const steps = [
    { n: 1, label: "Trip Details" },
    { n: 2, label: "Vehicle & Driver" },
    { n: 3, label: "Your Details" },
    { n: 4, label: "Confirmation" },
  ];

  return (
    <div className="card overflow-hidden">
      {/* progress */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 py-3">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            {i > 0 && <div className="mx-2 h-px flex-1 bg-slate-300" />}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  step > s.n
                    ? "bg-emerald-500 text-white"
                    : step === s.n
                      ? "bg-navy-800 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > s.n ? <Check className="h-3.5 w-3.5" /> : s.n}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  step >= s.n ? "text-navy-900" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="p-5 sm:p-8">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ─── Step 1 ─── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-bold text-navy-900">Enter trip details</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Pickup location *</Label>
                <Input value={pickup} onChange={(e) => setPickup(e.target.value)} />
              </div>
              <div>
                <Label>Destination *</Label>
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
                <Label>Number of passengers *</Label>
                <Input type="number" min={1} value={passengers} onChange={(e) => setPassengers(e.target.value)} />
              </div>
              <div>
                <Label>Travel date *</Label>
                <Input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
              </div>
              {tripType === "ROUNDTRIP" && (
                <div>
                  <Label>Return date</Label>
                  <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={goToVehicles} disabled={calculating}>
                {calculating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Calculating distance…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 2 ─── */}
        {step === 2 && result && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-bold text-navy-900">Choose your vehicle</h2>
            <p className="mt-1 text-sm text-slate-500">
              {pickup} → {destination} · {formatDate(travelDate)} · {passengers} passengers ·{" "}
              <strong>{result.totalDistanceKm?.toLocaleString("en-IN")} km</strong>
            </p>

            <div className="mt-5 space-y-3">
              {result.estimates?.map((v) => (
                <VehicleChoice
                  key={v.id}
                  v={v}
                  passengers={Number(passengers) || 1}
                  selected={selectedVehicle?.id === v.id}
                  onSelect={() => selectVehicle(v)}
                />
              ))}
            </div>

            {selectedVehicle && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Label>Driver preference (optional)</Label>
                <Select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                  <option value="">No Driver Preference</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.experienceYears} yrs, ★ {d.rating}
                    </option>
                  ))}
                </Select>
                <p className="mt-1 text-xs text-slate-500">
                  You can select a preferred driver or let us assign one.
                </p>
              </div>
            )}

            <PriceDisclaimer className="mt-4" />

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                variant="gold"
                disabled={!selectedVehicle}
                onClick={() => setStep(3)}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 3 ─── */}
        {step === 3 && selectedVehicle && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-bold text-navy-900">Your details</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Full name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Phone number *</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" />
              </div>
              <div className="sm:col-span-2">
                <Label>Email (optional)</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes / special requests (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm">
              <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gold-gradient" />
              <p className="font-semibold text-navy-900">Booking summary</p>
              <p className="mt-1 text-slate-600">
                {selectedVehicle.name} · {pickup} → {destination} · Estimated{" "}
                <strong>{formatINR(selectedVehicle.estimate.total)}</strong>
              </p>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="gold" onClick={submitBooking} disabled={busy}>
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <>Submit Booking <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 5 ─── */}
        {step === 4 && confirmation && (
          <div className="animate-fade-in text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-inset ring-emerald-200">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-navy-900">
              Booking Request Submitted
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Booking ID: <strong className="text-navy-900">{confirmation.bookingId}</strong>
            </p>
            <Badge tone="amber" className="mt-2.5">Pending Confirmation</Badge>

            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-left text-sm shadow-soft">
              <Row k="Vehicle" v={confirmation.vehicleName} />
              <Row k="Capacity" v={`${confirmation.capacity} seats`} />
              <Row k="Driver" v={confirmation.driverName || "No preference"} />
              <Row k="Pickup" v={confirmation.pickup} />
              <Row k="Destination" v={confirmation.destination} />
              <Row k="Distance" v={`${confirmation.distanceKm} km`} />
              <Row k="Passengers" v={String(confirmation.passengers)} />
              <Row k="Travel date" v={formatDate(confirmation.travelDate)} />
              <Row k="Estimated price" v={formatINR(confirmation.estimatedPrice)} strong />
            </div>

            <div className="mx-auto mt-4 max-w-md text-left">
              <PriceDisclaimer />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard" className="btn-primary">
                View My Booking
              </Link>
              <a href={telLink(settings.phones[0])} className="btn-outline">
                <Phone className="h-4 w-4" /> Call
              </a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-500">{k}</span>
      <span className={strong ? "font-bold text-navy-900" : "font-medium text-navy-900"}>{v}</span>
    </div>
  );
}

function VehicleChoice({
  v,
  passengers,
  selected,
  onSelect,
}: {
  v: VehicleEstimate;
  passengers: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const tooSmall = passengers > v.capacity;
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!v.available}
      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
        selected
          ? "border-gold-400 bg-gold-50 ring-2 ring-gold-300"
          : v.available
            ? "border-slate-200 bg-white hover:border-navy-300"
            : "border-slate-200 bg-slate-50 opacity-70"
      }`}
    >
      {v.imageUrl ? (
        <img src={v.imageUrl} alt={v.name} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="h-16 w-24 shrink-0 rounded-lg bg-slate-200" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-display font-bold text-navy-900">{v.name}</p>
          {selected && <Check className="h-4 w-4 text-gold-600" />}
        </div>
        <p className="text-xs text-slate-500">
          {VEHICLE_TYPE_LABELS[v.type]} · {v.capacity} seats · {v.ac ? "AC" : "Non-AC"}
        </p>
        {tooSmall && (
          <p className="mt-1 text-xs font-medium text-red-600">
            Capacity is less than your group size ({passengers}).
          </p>
        )}
        {!v.available && <p className="mt-1 text-xs font-medium text-red-600">{v.unavailableReason}</p>}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-slate-500">Estimated</p>
        <p className="text-lg font-extrabold text-navy-900">{formatINR(v.estimate.total)}</p>
      </div>
    </button>
  );
}
