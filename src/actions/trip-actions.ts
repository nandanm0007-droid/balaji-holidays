"use server";

import { prisma } from "@/lib/db";
import { calculateRoadDistance } from "@/lib/distance";
import { calculateEstimate } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { parseJSON } from "@/lib/utils";
import type { EstimateResponse, DriverOption, VehicleEstimate } from "@/lib/types";
import type { VehicleType } from "@/lib/constants";

export type CalcInput = {
  pickup: string;
  destination: string;
  travelDate: string;
  returnDate?: string | null;
  tripType: "ONEWAY" | "ROUNDTRIP";
  passengers: number;
  manualDistanceKm?: number | null;
};

/** Returns true if the vehicle is already booked on an overlapping date range. */
export async function isVehicleBookedForDates(
  vehicleId: string,
  travelDate: Date,
  returnDate: Date | null,
  excludeBookingId?: string,
): Promise<boolean> {
  const start = new Date(travelDate);
  start.setHours(0, 0, 0, 0);
  const end = returnDate ? new Date(returnDate) : new Date(start);
  end.setHours(23, 59, 59, 999);

  const conflicting = await prisma.booking.findFirst({
    where: {
      vehicleId,
      status: { in: ["PENDING", "UNDER_REVIEW", "CONFIRMED"] },
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      OR: [
        { travelDate: { lte: end, gte: start } },
        { returnDate: { gte: start, lte: end } },
        { travelDate: { lte: start }, returnDate: { gte: end } },
        { travelDate: { lte: start }, returnDate: null },
      ],
    },
  });
  return !!conflicting;
}

export async function calculateTripEstimates(
  input: CalcInput,
): Promise<EstimateResponse> {
  const settings = await getSettings();

  if (!input.pickup?.trim()) {
    return { ok: false, error: "Please enter a pickup location." };
  }
  if (!input.destination?.trim()) {
    return { ok: false, error: "Please select a destination." };
  }
  if (!input.travelDate) {
    return { ok: false, error: "Please select a travel date." };
  }

  const travelDate = new Date(input.travelDate);
  if (isNaN(travelDate.getTime())) {
    return { ok: false, error: "Please select a valid travel date." };
  }
  let returnDate: Date | null = null;
  if (input.tripType === "ROUNDTRIP" && input.returnDate) {
    returnDate = new Date(input.returnDate);
    if (isNaN(returnDate.getTime()) || returnDate < travelDate) {
      return { ok: false, error: "Return date must be after the travel date." };
    }
  }

  // 1) Distance
  let oneWayDistanceKm: number | null = null;
  let source: "routing" | "estimate" | "fallback" = "estimate";

  if (input.manualDistanceKm && input.manualDistanceKm > 0) {
    oneWayDistanceKm = input.manualDistanceKm;
    source = "estimate";
  } else {
    const dist = await calculateRoadDistance(input.pickup, input.destination);
    if (!dist.ok) {
      return {
        ok: false,
        error:
          "We couldn't calculate the road distance. Please try again.",
      };
    }
    oneWayDistanceKm = dist.distanceKm!;
    source = dist.source;
  }

  const totalDistanceKm =
    input.tripType === "ROUNDTRIP" && settings.autoDoubleReturn
      ? oneWayDistanceKm * 2
      : oneWayDistanceKm;

  // 2) Vehicles + pricing
  const vehicles = await prisma.vehicle.findMany({
    where: { active: true },
    include: { pricing: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ capacity: "desc" }],
  });

  const estimates: VehicleEstimate[] = [];
  for (const v of vehicles) {
    const est = calculateEstimate(v, v.pricing, {
      oneWayDistanceKm,
      tripType: input.tripType,
      travelDate,
      returnDate,
      autoDoubleReturn: settings.autoDoubleReturn,
    });

    let available = v.status === "AVAILABLE";
    let unavailableReason: string | null = null;
    if (v.status !== "AVAILABLE") {
      unavailableReason = `This vehicle is currently ${statusLabel(v.status)}.`;
    }
    const booked = await isVehicleBookedForDates(v.id, travelDate, returnDate);
    if (booked) {
      available = false;
      unavailableReason = "Unavailable for the selected dates.";
    }
    if (v.pricing?.pricePerKm == null || v.pricing.pricePerKm <= 0) {
      available = false;
      unavailableReason = "Pricing not yet configured. Please contact Balaji Holidays.";
    }

    estimates.push({
      id: v.id,
      name: v.name,
      slug: v.slug,
      type: v.type as VehicleType,
      capacity: v.capacity,
      ac: v.ac,
      status: v.status,
      showPricePerKm: v.showPricePerKm && settings.showPricePerKmGlobal,
      pricePerKm: v.pricing?.pricePerKm ?? 0,
      features: parseJSON<string[]>(v.features, []),
      imageUrl: v.images[0]?.url ?? null,
      description: v.description,
      estimate: {
        oneWayDistanceKm: est.oneWayDistanceKm,
        totalDistanceKm: est.totalDistanceKm,
        billableKm: est.billableKm,
        actualDistanceKm: est.actualDistanceKm,
        minBillingKm: est.minBillingKm,
        minKmPerDay: est.minKmPerDay,
        tripDays: est.tripDays,
        lines: est.lines,
        total: est.total,
      },
      available,
      unavailableReason,
    });
  }

  return {
    ok: true,
    source,
    oneWayDistanceKm,
    totalDistanceKm,
    estimates,
  };
}

function statusLabel(s: string): string {
  switch (s) {
    case "BOOKED":
      return "booked";
    case "ON_TRIP":
      return "on trip";
    case "MAINTENANCE":
      return "under maintenance";
    case "UNAVAILABLE":
      return "unavailable";
    default:
      return "unavailable";
  }
}

export async function getAvailableDrivers(
  travelDate: string,
  returnDate: string | null | undefined,
  vehicleId?: string,
): Promise<DriverOption[]> {
  const start = new Date(travelDate);
  start.setHours(0, 0, 0, 0);
  const end = returnDate ? new Date(returnDate) : new Date(start);
  end.setHours(23, 59, 59, 999);

  const drivers = await prisma.driver.findMany({
    where: {
      active: true,
      available: true,
      ...(vehicleId
        ? { driverLinks: { some: { vehicleId } } }
        : {}),
    },
    include: { driverLinks: true, bookings: { where: { status: { in: ["CONFIRMED", "PENDING", "UNDER_REVIEW"] } } } },
  });

  return drivers
    .filter((d) => {
      const conflict = d.bookings.some((b) => {
        const bStart = b.travelDate;
        const bEnd = b.returnDate ?? b.travelDate;
        return bStart <= end && bEnd >= start;
      });
      return !conflict;
    })
    .map((d) => ({
      id: d.id,
      name: d.name,
      photoUrl: d.photoUrl,
      experienceYears: d.experienceYears,
      languages: parseJSON<string[]>(d.languages, []),
      rating: d.rating,
      bio: d.bio,
      available: true,
    }));
}
