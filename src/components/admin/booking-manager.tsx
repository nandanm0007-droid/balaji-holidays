"use client";

import * as React from "react";
import {
  setBookingStatus,
  setFinalPrice,
  setBookingNotes,
  assignDriverToBooking,
} from "@/actions/admin-actions";
import { formatINR, formatDate } from "@/lib/utils";
import { Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { ChevronDown, Phone, Mail } from "@/components/ui/icons";

type BookingRow = {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  vehicleName: string;
  vehicleId: string;
  driverId: string | null;
  driverName: string | null;
  pickup: string;
  destination: string;
  travelDate: string;
  returnDate: string | null;
  tripType: string;
  passengers: number;
  distanceKm: number;
  estimatedPrice: number;
  finalPrice: number | null;
  status: string;
  adminNotes: string | null;
  customerNotes: string | null;
  createdAt: string;
};

type DriverRow = { id: string; name: string };

export function BookingManager({
  bookings,
  drivers,
  statusFilter,
}: {
  bookings: BookingRow[];
  drivers: DriverRow[];
  statusFilter: string;
}) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [finalPrices, setFinalPrices] = React.useState<Record<string, string>>({});
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const statusTone = (s: string) => {
    switch (s) {
      case "CONFIRMED":
      case "COMPLETED":
        return "green" as const;
      case "REJECTED":
      case "CANCELLED":
        return "red" as const;
      case "UNDER_REVIEW":
        return "amber" as const;
      default:
        return "blue" as const;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Booking Management</h1>
      <p className="text-sm text-slate-500">
        Review requests, set the final confirmed price and manage status.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["ALL", "PENDING", "UNDER_REVIEW", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"].map((s) => (
          <a
            key={s}
            href={s === "ALL" ? "/admin/bookings" : `/admin/bookings?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              statusFilter === s ? "bg-navy-800 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {s === "ALL" ? "All" : BOOKING_STATUS_LABELS[s as keyof typeof BOOKING_STATUS_LABELS]}
          </a>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {bookings.length === 0 && (
          <div className="card p-8 text-center text-slate-500">No bookings found.</div>
        )}
        {bookings.map((b) => {
          const open = openId === b.id;
          return (
            <div key={b.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : b.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900">{b.bookingId}</span>
                    <Badge tone={statusTone(b.status)}>
                      {BOOKING_STATUS_LABELS[b.status as keyof typeof BOOKING_STATUS_LABELS]}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {b.customerName} · {b.vehicleName} · {b.pickup} → {b.destination}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Estimate</p>
                    <p className="font-bold text-navy-900">{formatINR(b.estimatedPrice)}</p>
                  </div>
                  {b.finalPrice != null && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Final</p>
                      <p className="font-bold text-emerald-600">{formatINR(b.finalPrice)}</p>
                    </div>
                  )}
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
              </button>

              {open && (
                <div className="border-t border-slate-100 p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
                    <Detail k="Travel date" v={formatDate(b.travelDate)} />
                    <Detail k="Return date" v={b.returnDate ? formatDate(b.returnDate) : "—"} />
                    <Detail k="Trip type" v={b.tripType === "ROUNDTRIP" ? "Round Trip" : "One Way"} />
                    <Detail k="Passengers" v={String(b.passengers)} />
                    <Detail k="Distance" v={`${b.distanceKm} km`} />
                    <Detail k="Vehicle" v={b.vehicleName} />
                    <Detail k="Driver" v={b.driverName || "Unassigned"} />
                    <Detail
                      k="Customer"
                      v={
                        <span className="flex flex-col">
                          <a href={`tel:${b.customerPhone}`} className="flex items-center gap-1 text-navy-700 hover:underline">
                            <Phone className="h-3.5 w-3.5" /> {b.customerPhone}
                          </a>
                          {b.customerEmail && (
                            <a href={`mailto:${b.customerEmail}`} className="flex items-center gap-1 text-navy-700 hover:underline">
                              <Mail className="h-3.5 w-3.5" /> {b.customerEmail}
                            </a>
                          )}
                        </span>
                      }
                    />
                  </div>

                  {b.customerNotes && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                      <strong>Customer notes:</strong> {b.customerNotes}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-end gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                      <select
                        value={b.status}
                        onChange={async (e) => {
                          await setBookingStatus(b.id, e.target.value);
                        }}
                        className="input w-44"
                      >
                        {Object.entries(BOOKING_STATUS_LABELS).map(([k, label]) => (
                          <option key={k} value={k}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Assign driver</label>
                      <select
                        value={b.driverId || ""}
                        onChange={async (e) => {
                          await assignDriverToBooking(b.id, e.target.value || null);
                        }}
                        className="input w-44"
                      >
                        <option value="">No driver</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Final confirmed price (₹)</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={finalPrices[b.id] ?? (b.finalPrice != null ? String(b.finalPrice) : "")}
                          onChange={(e) => setFinalPrices((f) => ({ ...f, [b.id]: e.target.value }))}
                          className="w-40"
                          placeholder={formatINR(b.estimatedPrice)}
                        />
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={async () => {
                            const v = Number(finalPrices[b.id]);
                            if (v) await setFinalPrice(b.id, v);
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1 block text-xs font-medium text-slate-600">Admin notes</label>
                    <div className="flex gap-2">
                      <Textarea
                        value={notes[b.id] ?? b.adminNotes ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [b.id]: e.target.value }))}
                        className="min-h-[60px]"
                      />
                      <Button
                        size="sm"
                        onClick={async () => {
                          await setBookingNotes(b.id, notes[b.id] ?? b.adminNotes ?? "");
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{k}</p>
      <p className="font-medium text-navy-900">{v}</p>
    </div>
  );
}
