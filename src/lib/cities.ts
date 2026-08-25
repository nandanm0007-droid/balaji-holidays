// Built-in coordinate reference for demo-mode distance estimation.
// When a real routing provider (Google/OpenRouteService) is configured via
// MAPS_API_KEY, these are only used as a fallback.

export type City = { name: string; aliases?: string[]; lat: number; lng: number };

export const CITIES: City[] = [
  { name: "Shivamogga", aliases: ["shimoga"], lat: 13.9299, lng: 75.5681 },
  { name: "Bengaluru", aliases: ["bangalore", "bengaluru", "bangaluru"], lat: 12.9716, lng: 77.5946 },
  { name: "Mysuru", aliases: ["mysore"], lat: 12.2958, lng: 76.6394 },
  { name: "Mangaluru", aliases: ["mangalore"], lat: 12.9141, lng: 74.856 },
  { name: "Hubballi", aliases: ["hubli", "dharwad"], lat: 15.3647, lng: 75.124 },
  { name: "Belagavi", aliases: ["belgaum"], lat: 15.8497, lng: 74.4977 },
  { name: "Udupi", lat: 13.3409, lng: 74.7421 },
  { name: "Chikkamagaluru", aliases: ["chikmagalur"], lat: 13.3153, lng: 75.7754 },
  { name: "Davanagere", lat: 14.4644, lng: 75.9218 },
  { name: "Hassan", lat: 13.0068, lng: 76.0996 },
  { name: "Chitradurga", lat: 14.2283, lng: 76.4043 },
  { name: "Sagar", aliases: ["sagara"], lat: 14.1645, lng: 75.0289 },
  { name: "Thirthahalli", aliases: ["tirthahalli"], lat: 13.6881, lng: 75.2492 },
  { name: "Hosanagara", aliases: ["hosanagar"], lat: 13.9136, lng: 75.0731 },
  { name: "Bhadravathi", aliases: ["bhadravati"], lat: 13.8287, lng: 75.7044 },
  { name: "Jog Falls", aliases: ["jog"], lat: 14.2266, lng: 74.8091 },
  { name: "Gokarna", lat: 14.5478, lng: 74.3186 },
  { name: "Murudeshwara", aliases: ["murudeshwar"], lat: 14.094, lng: 74.4841 },
  { name: "Kollur", lat: 13.8531, lng: 74.8068 },
  { name: "Dharmasthala", lat: 12.9626, lng: 75.3821 },
  { name: "Kukke Subramanya", aliases: ["subramanya", "kukke"], lat: 12.6674, lng: 75.6198 },
  { name: "Hampi", lat: 15.335, lng: 76.46 },
  { name: "Goa", aliases: ["panaji", "panjim"], lat: 15.4909, lng: 73.8278 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  { name: "Tirupati", lat: 13.6288, lng: 79.4192 },
  { name: "Kochi", aliases: ["cochin"], lat: 9.9312, lng: 76.2673 },
  { name: "Udupi Sri Krishna", lat: 13.3409, lng: 74.7421 },
  { name: "Hornadu", aliases: ["horanadu"], lat: 13.3135, lng: 75.3465 },
  { name: "Sringeri", lat: 13.4168, lng: 75.2521 },
  { name: "Kemmannugundi", aliases: ["kemmangundi"], lat: 13.5434, lng: 75.7557 },
  { name: "Kudremukh", lat: 13.1298, lng: 75.2667 },
  { name: "Agumbe", lat: 13.5068, lng: 75.0947 },
  { name: "Kodachadri", lat: 13.8631, lng: 74.8681 },
  { name: "Ballari", aliases: ["bellary"], lat: 15.1394, lng: 76.9214 },
  { name: "Vijayapura", aliases: ["bijapur"], lat: 16.8302, lng: 75.71 },
  { name: "Kalaburagi", aliases: ["gulbarga"], lat: 17.3297, lng: 76.8343 },
  { name: "Delhi", aliases: ["new delhi"], lat: 28.6139, lng: 77.209 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
];

const ROAD_FACTOR = 1.32; // rough multiplier to convert straight-line to road distance

export function normalizeCity(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "");
}

export function lookupCity(input: string): City | null {
  const q = normalizeCity(input);
  if (!q) return null;
  for (const c of CITIES) {
    if (normalizeCity(c.name) === q) return c;
    if (c.aliases?.some((a) => normalizeCity(a) === q)) return c;
  }
  // partial match fallback
  for (const c of CITIES) {
    if (q.includes(normalizeCity(c.name)) || normalizeCity(c.name).includes(q)) {
      return c;
    }
  }
  return null;
}

function haversine(a: City, b: City): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Demo-mode road distance estimate (km), rounded to nearest 5. */
export function estimateRoadDistanceKm(origin: string, destination: string): number | null {
  const a = lookupCity(origin);
  const b = lookupCity(destination);
  if (!a || !b) return null;
  const straight = haversine(a, b);
  const road = straight * ROAD_FACTOR;
  return Math.max(5, Math.round(road / 5) * 5);
}
