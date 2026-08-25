import { estimateRoadDistanceKm } from "@/lib/cities";

export type DistanceResult = {
  ok: boolean;
  distanceKm?: number;
  source: "routing" | "estimate" | "fallback";
  error?: string;
};

/**
 * Calculates road distance between origin and destination.
 * Provider is configured via env:
 *   DISTANCE_PROVIDER=google|openrouteservice|demo
 *   MAPS_API_KEY=...
 * Falls back to the built-in estimate in demo mode (clearly labelled).
 */
export async function calculateRoadDistance(
  origin: string,
  destination: string,
): Promise<DistanceResult> {
  const provider = process.env.DISTANCE_PROVIDER || "demo";
  const key = process.env.MAPS_API_KEY;

  if (!origin || !destination) {
    return { ok: false, source: "fallback", error: "Please enter both pickup location and destination." };
  }

  // Try a real routing provider first when configured with an API key.
  if (provider === "google" && key) {
    const res = await googleDistance(origin, destination, key);
    if (res.ok) return res;
  } else if (provider === "openrouteservice" && key) {
    const res = await orsDistance(origin, destination, key);
    if (res.ok) return res;
  }

  // Always fall back to the built-in estimate so distance (and therefore price)
  // is estimated automatically, even if the routing provider fails or has no key.
  const estimate = estimateRoadDistanceKm(origin, destination);
  if (estimate != null) {
    return { ok: true, distanceKm: estimate, source: "estimate" };
  }
  return {
    ok: false,
    source: "fallback",
    error: "We couldn't calculate the road distance. Please try again.",
  };
}

async function googleDistance(origin: string, destination: string, key: string): Promise<DistanceResult> {
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    url.searchParams.set("key", key);
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.status !== "OK" || !data.routes?.[0]) {
      return { ok: false, source: "fallback", error: "We couldn't calculate the road distance. Please try again." };
    }
    const km = data.routes[0].legs[0].distance.value / 1000;
    return { ok: true, distanceKm: Math.round(km * 10) / 10, source: "routing" };
  } catch {
    return { ok: false, source: "fallback", error: "We couldn't calculate the road distance. Please try again." };
  }
}

async function orsDistance(origin: string, destination: string, key: string): Promise<DistanceResult> {
  try {
    const a = await geocodeORS(origin, key);
    const b = await geocodeORS(destination, key);
    if (!a || !b) return { ok: false, source: "fallback", error: "We couldn't calculate the road distance. Please try again." };
    const url = new URL("https://api.openrouteservice.org/v2/directions/driving-car");
    url.searchParams.set("api_key", key);
    url.searchParams.set("start", `${a.lng},${a.lat}`);
    url.searchParams.set("end", `${b.lng},${b.lat}`);
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    const km = data?.routes?.[0]?.summary?.distance / 1000;
    if (!km) return { ok: false, source: "fallback", error: "We couldn't calculate the road distance. Please try again." };
    return { ok: true, distanceKm: Math.round(km * 10) / 10, source: "routing" };
  } catch {
    return { ok: false, source: "fallback", error: "We couldn't calculate the road distance. Please try again." };
  }
}

async function geocodeORS(q: string, key: string) {
  const url = new URL("https://api.openrouteservice.org/geocode/search");
  url.searchParams.set("api_key", key);
  url.searchParams.set("text", q);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  const coord = data?.features?.[0]?.geometry?.coordinates;
  if (!coord) return null;
  return { lng: coord[0], lat: coord[1] };
}
