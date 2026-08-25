import type { Vehicle, VehiclePricing } from "@prisma/client";
import { daysBetween } from "@/lib/utils";

export type TripInput = {
  oneWayDistanceKm: number;
  tripType: "ONEWAY" | "ROUNDTRIP";
  travelDate: Date;
  returnDate?: Date | null;
  autoDoubleReturn: boolean;
  waitingHours?: number;
};

export type PriceLine = {
  label: string;
  amount: number;
  note?: string;
};

export type EstimateResult = {
  oneWayDistanceKm: number;
  totalDistanceKm: number;
  billableKm: number;
  actualDistanceKm: number;
  minBillingKm: number;
  minKmPerDay: number;
  tripDays: number;
  baseFare: number;
  lines: PriceLine[];
  total: number;
  currency: "INR";
};

/**
 * Core pricing engine.
 * Default formula: Distance × Price Per KM, plus admin-enabled extras.
 */
export function calculateEstimate(
  vehicle: Vehicle,
  pricing: VehiclePricing | null,
  input: TripInput,
): EstimateResult {
  const pricePerKm = pricing?.pricePerKm ?? 0;
  const minBillingKm = pricing?.minBillingKm ?? 0;
  const minKmPerDay = pricing?.minKmPerDay ?? 0;

  const oneWay = Math.max(0, input.oneWayDistanceKm);
  const isRound = input.tripType === "ROUNDTRIP" && input.autoDoubleReturn;
  const tripDays = input.returnDate
    ? Math.max(1, daysBetween(input.travelDate, input.returnDate))
    : 1;

  const totalDistanceKm = isRound ? oneWay * 2 : oneWay;
  const actualDistanceKm = totalDistanceKm;

  // Minimum billing rules
  const minByDay = minKmPerDay * tripDays;
  const billableKm = Math.max(totalDistanceKm, minBillingKm, minByDay);

  const baseFare = billableKm * pricePerKm;

  const lines: PriceLine[] = [];
  lines.push({
    label: `Distance fare (${billableKm.toLocaleString("en-IN")} km × ${pricePerKm.toLocaleString("en-IN")}/km)`,
    amount: baseFare,
  });

  let total = baseFare;

  const push = (label: string, amount: number, enabled: boolean) => {
    if (!enabled || amount <= 0) return;
    lines.push({ label, amount });
    total += amount;
  };

  if (pricing) {
    push(
      `Driver allowance (${tripDays} day${tripDays > 1 ? "s" : ""})`,
      pricing.driverAllowancePerDay * tripDays,
      pricing.driverAllowanceEnabled,
    );
    push("Toll charges", pricing.tollCharge, pricing.tollEnabled);
    push("Parking charges", pricing.parkingCharge, pricing.parkingEnabled);
    push("Permit charges", pricing.permitCharge, pricing.permitEnabled);
    push(
      `Night charges (${tripDays} night${tripDays > 1 ? "s" : ""})`,
      pricing.nightCharge * tripDays,
      pricing.nightEnabled,
    );
    push(
      "Waiting charges",
      (pricing.waitingChargePerHour ?? 0) * (input.waitingHours ?? 0),
      pricing.waitingEnabled,
    );
    push("Additional fixed charge", pricing.fixedCharge, pricing.fixedEnabled);
    if (pricing.seasonalEnabled && pricing.seasonalChargePct > 0) {
      const amt = baseFare * (pricing.seasonalChargePct / 100);
      push(`Seasonal charge (${pricing.seasonalChargePct}%)`, amt, true);
    }
  }

  return {
    oneWayDistanceKm: oneWay,
    totalDistanceKm,
    billableKm: Math.round(billableKm),
    actualDistanceKm: Math.round(actualDistanceKm),
    minBillingKm,
    minKmPerDay,
    tripDays,
    baseFare,
    lines,
    total: Math.round(total),
    currency: "INR",
  };
}

export function estimateForPackages(
  vehicle: Vehicle,
  pricing: VehiclePricing | null,
  input: TripInput,
) {
  return calculateEstimate(vehicle, pricing, input);
}
