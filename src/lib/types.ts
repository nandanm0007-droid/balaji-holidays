import type { VehicleType } from "@/lib/constants";

export type VehicleEstimate = {
  id: string;
  name: string;
  slug: string;
  type: VehicleType;
  capacity: number;
  ac: boolean;
  status: string;
  showPricePerKm: boolean;
  pricePerKm: number;
  features: string[];
  imageUrl: string | null;
  description: string | null;
  estimate: {
    oneWayDistanceKm: number;
    totalDistanceKm: number;
    billableKm: number;
    actualDistanceKm: number;
    minBillingKm: number;
    minKmPerDay: number;
    tripDays: number;
    lines: { label: string; amount: number; note?: string }[];
    total: number;
  };
  available: boolean;
  unavailableReason: string | null;
};

export type EstimateResponse = {
  ok: boolean;
  error?: string;
  source?: "routing" | "estimate" | "fallback";
  oneWayDistanceKm?: number;
  totalDistanceKm?: number;
  estimates?: VehicleEstimate[];
};

export type DriverOption = {
  id: string;
  name: string;
  photoUrl: string | null;
  experienceYears: number;
  languages: string[];
  rating: number;
  bio: string | null;
  available: boolean;
};
