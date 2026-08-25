import { prisma } from "@/lib/db";
import { parseJSON } from "@/lib/utils";

export type SiteSettings = {
  businessName: string;
  tagline: string;
  city: string;
  state: string;
  address: string;
  phones: string[];
  email: string;
  instagram: string;
  whatsappNumber: string;
  whatsappMessage: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  ownerName: string;
  ownerBio: string;
  ownerImage: string;
  services: string[];
  seoTitle: string;
  seoDescription: string;
  footerText: string;
  distanceMode: "auto" | "manual" | "both";
  showPricePerKmGlobal: boolean;
  autoDoubleReturn: boolean;
  mapEmbedUrl: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  businessName: "Balaji Holidays Travels",
  tagline: "Your Journey, Our Passion — Travels & Vehicle Rentals",
  city: "Shivamogga",
  state: "Karnataka",
  address: "Sahyadri College OPP., Shivamogga, Karnataka, India",
  phones: ["8880555522", "6360872228", "8660061227"],
  email: "",
  instagram: "@balaji_holidays__",
  whatsappNumber: "918880555522",
  whatsappMessage:
    "Hello Balaji Holidays, I would like to enquire about vehicle availability and estimated trip price.",
  heroTitle: "Travel Comfortably. Explore Freely.",
  heroSubtitle:
    "Buses, Tempo Travellers, Innova cars, train & flight booking and customized travel packages from Balaji Holidays, Shivamogga.",
  aboutText:
    "Balaji Holidays is a trusted travel and vehicle rental service based in Shivamogga, Karnataka. We provide buses, Tempo Travellers, Innova cars and other vehicles for local and outstation trips, along with customized travel packages for groups, families and corporate events. We also offer train booking and flight booking services for a complete travel experience. All types of vehicles available, package trips available, and 24 hours service.",
  ownerName: "",
  ownerBio: "",
  ownerImage: "",
  services: [
    "Bus rental",
    "Tempo Traveller",
    "Innova",
    "Other vehicle rentals",
    "Package trips",
    "Train booking",
    "Flight booking",
    "Group travel",
    "Local trips",
    "Outstation trips",
    "Customized trips",
    "24 hours service",
  ],
  seoTitle:
    "Balaji Holidays Travels Shivamogga | Bus Rental, Tempo Traveller, Innova, Train & Flight Booking — Travel Agency",
  seoDescription:
    "Balaji Holidays Travels, Sahyadri College OPP., Shivamogga — bus rental, Tempo Traveller, Innova car rental, train booking, flight booking, package trips and customized travel packages. All types of vehicles available, 24 hours service.",
  footerText:
    "All types of vehicles available. Train & flight booking available. Package trips available. 24 hours service.",
  distanceMode: "both",
  showPricePerKmGlobal: true,
  autoDoubleReturn: true,
  mapEmbedUrl:
    "https://www.google.com/maps?q=Sahyadri+College,Shivamogga,Karnataka,India&output=embed",
};

const SETTINGS_KEY = "site_settings";

let cache: SiteSettings | null = null;

export async function getSettings(): Promise<SiteSettings> {
  if (cache) return cache;
  const row = await prisma.siteSetting.findUnique({
    where: { key: SETTINGS_KEY },
  });
  const merged = { ...DEFAULT_SETTINGS, ...parseJSON<Partial<SiteSettings>>(row?.value, {}) };
  cache = merged;
  return merged;
}

export async function updateSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await prisma.siteSetting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: JSON.stringify(next) },
    create: { key: SETTINGS_KEY, value: JSON.stringify(next) },
  });
  cache = next;
  return next;
}

export function clearSettingsCache() {
  cache = null;
}
