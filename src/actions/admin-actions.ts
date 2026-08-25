"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/settings";
import { slugify, parseJSON } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type AdminResult = { ok: boolean; error?: string };

async function guard(): Promise<{ id: string; name: string } | null> {
  const session = await requireAdmin();
  if (!session) return null;
  return { id: session.id, name: session.name || "Admin" };
}

async function log(action: string, entity: string, entityId?: string, details?: string) {
  await prisma.auditLog.create({
    data: { action, entity, entityId, details, actorName: "admin" },
  });
}

// ───────────────────────── Vehicles ─────────────────────────

const pricingSchema = z.object({
  pricePerKm: z.coerce.number().min(0),
  minBillingKm: z.coerce.number().min(0).default(0),
  minKmPerDay: z.coerce.number().min(0).default(0),
  driverAllowancePerDay: z.coerce.number().min(0).default(0),
  driverAllowanceEnabled: z.coerce.boolean().default(false),
  tollEnabled: z.coerce.boolean().default(false),
  tollCharge: z.coerce.number().min(0).default(0),
  parkingEnabled: z.coerce.boolean().default(false),
  parkingCharge: z.coerce.number().min(0).default(0),
  permitEnabled: z.coerce.boolean().default(false),
  permitCharge: z.coerce.number().min(0).default(0),
  nightEnabled: z.coerce.boolean().default(false),
  nightCharge: z.coerce.number().min(0).default(0),
  waitingEnabled: z.coerce.boolean().default(false),
  waitingChargePerHour: z.coerce.number().min(0).default(0),
  fixedEnabled: z.coerce.boolean().default(false),
  fixedCharge: z.coerce.number().min(0).default(0),
  seasonalEnabled: z.coerce.boolean().default(false),
  seasonalChargePct: z.coerce.number().min(0).default(0),
  packagePrice: z.coerce.number().min(0).optional(),
});

export async function saveVehicle(
  raw: Record<string, unknown>,
  id?: string,
): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const name = String(raw.name || "").trim();
  if (name.length < 2) return { ok: false, error: "Vehicle name is required." };
  const capacity = Number(raw.capacity);
  if (!capacity || capacity < 1) return { ok: false, error: "Seating capacity is required." };

  const featuresRaw = String(raw.features || "");
  const features = featuresRaw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const pricing = pricingSchema.parse({
    pricePerKm: raw.pricePerKm ?? 0,
    minBillingKm: raw.minBillingKm ?? 0,
    minKmPerDay: raw.minKmPerDay ?? 0,
    driverAllowancePerDay: raw.driverAllowancePerDay ?? 0,
    driverAllowanceEnabled: raw.driverAllowanceEnabled === "true" || raw.driverAllowanceEnabled === true,
    tollEnabled: raw.tollEnabled === "true" || raw.tollEnabled === true,
    tollCharge: raw.tollCharge ?? 0,
    parkingEnabled: raw.parkingEnabled === "true" || raw.parkingEnabled === true,
    parkingCharge: raw.parkingCharge ?? 0,
    permitEnabled: raw.permitEnabled === "true" || raw.permitEnabled === true,
    permitCharge: raw.permitCharge ?? 0,
    nightEnabled: raw.nightEnabled === "true" || raw.nightEnabled === true,
    nightCharge: raw.nightCharge ?? 0,
    waitingEnabled: raw.waitingEnabled === "true" || raw.waitingEnabled === true,
    waitingChargePerHour: raw.waitingChargePerHour ?? 0,
    fixedEnabled: raw.fixedEnabled === "true" || raw.fixedEnabled === true,
    fixedCharge: raw.fixedCharge ?? 0,
    seasonalEnabled: raw.seasonalEnabled === "true" || raw.seasonalEnabled === true,
    seasonalChargePct: raw.seasonalChargePct ?? 0,
    packagePrice: raw.packagePrice ? Number(raw.packagePrice) : undefined,
  });

  const images = String(raw.images || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const data = {
    name,
    type: (String(raw.type || "OTHER")) as any,
    capacity,
    ac: raw.ac === "true" || raw.ac === true || raw.ac == null,
    description: String(raw.description || "").trim() || null,
    features: JSON.stringify(features),
    status: (String(raw.status || "AVAILABLE")) as any,
    showPricePerKm: raw.showPricePerKm !== "false" && raw.showPricePerKm !== false,
  };

  if (id) {
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "Vehicle not found." };
    await prisma.vehicle.update({ where: { id }, data });
    await prisma.vehiclePricing.upsert({
      where: { vehicleId: id },
      update: pricing,
      create: { vehicleId: id, ...pricing, pricePerKm: pricing.pricePerKm },
    });
    if (images.length) {
      await prisma.vehicleImage.deleteMany({ where: { vehicleId: id } });
      await prisma.vehicleImage.createMany({
        data: images.map((url, i) => ({
          vehicleId: id,
          url,
          alt: `${name} image ${i + 1}`,
          sortOrder: i,
        })),
      });
    }
    await log("VEHICLE_UPDATED", "Vehicle", id, name);
  } else {
    const slug = await uniqueSlug(slugify(name));
    const vehicle = await prisma.vehicle.create({
      data: { ...data, slug },
    });
    await prisma.vehiclePricing.create({
      data: { vehicleId: vehicle.id, ...pricing },
    });
    if (images.length) {
      await prisma.vehicleImage.createMany({
        data: images.map((url, i) => ({
          vehicleId: vehicle.id,
          url,
          alt: `${name} image ${i + 1}`,
          sortOrder: i,
        })),
      });
    }
    await log("VEHICLE_CREATED", "Vehicle", vehicle.id, name);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || "vehicle";
  let i = 2;
  while (await prisma.vehicle.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function deleteVehicle(id: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.vehicle.delete({ where: { id } }).catch(() => null);
  await log("VEHICLE_DELETED", "Vehicle", id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setVehicleActive(id: string, active: boolean): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.vehicle.update({ where: { id }, data: { active } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setVehicleStatus(id: string, status: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.vehicle.update({ where: { id }, data: { status: status as any } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function savePricing(
  vehicleId: string,
  raw: Record<string, unknown>,
): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  const data = pricingSchema.parse(raw);
  await prisma.vehiclePricing.upsert({
    where: { vehicleId },
    update: data,
    create: { vehicleId, ...data },
  });
  await log("PRICING_UPDATED", "VehiclePricing", vehicleId);
  revalidatePath("/", "layout");
  return { ok: true };
}

// ───────────────────────── Bookings ─────────────────────────

export async function setBookingStatus(id: string, status: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.booking.update({ where: { id }, data: { status: status as any } });
  await log("BOOKING_STATUS", "Booking", id, status);
  revalidatePath("/admin");
  return { ok: true };
}

export async function setFinalPrice(id: string, finalPrice: number): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  if (!finalPrice || finalPrice < 0) return { ok: false, error: "Enter a valid final price." };
  await prisma.booking.update({ where: { id }, data: { finalPrice } });
  await log("BOOKING_FINAL_PRICE", "Booking", id, `₹${finalPrice}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function setBookingNotes(id: string, notes: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.booking.update({ where: { id }, data: { adminNotes: notes } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function assignDriverToBooking(id: string, driverId: string | null): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.booking.update({ where: { id }, data: { driverId } });
  revalidatePath("/admin");
  return { ok: true };
}

// ───────────────────────── Enquiries ─────────────────────────

export async function setEnquiryStatus(id: string, status: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.enquiry.update({ where: { id }, data: { status: status as any } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function setEnquiryNotes(id: string, notes: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.enquiry.update({ where: { id }, data: { adminNotes: notes } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function setPackageEnquiryStatus(id: string, status: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.packageEnquiry.update({ where: { id }, data: { status: status as any } });
  revalidatePath("/admin");
  return { ok: true };
}

// ───────────────────────── Drivers ─────────────────────────

export async function saveDriver(raw: Record<string, unknown>, id?: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  const name = String(raw.name || "").trim();
  if (name.length < 2) return { ok: false, error: "Driver name is required." };
  const languages = String(raw.languages || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const vehicleIds = Array.isArray(raw.vehicleIds) ? (raw.vehicleIds as string[]) : [];

  const data = {
    name,
    phone: String(raw.phone || "").trim() || null,
    photoUrl: String(raw.photoUrl || "").trim() || null,
    experienceYears: Number(raw.experienceYears || 0),
    languages: JSON.stringify(languages),
    bio: String(raw.bio || "").trim() || null,
    rating: Number(raw.rating || 4.5),
    active: raw.active !== "false" && raw.active !== false,
    available: raw.available !== "false" && raw.available !== false,
  };

  let driverId = id;
  if (id) {
    await prisma.driver.update({ where: { id }, data });
  } else {
    const driver = await prisma.driver.create({ data });
    driverId = driver.id;
  }
  if (driverId) {
    await prisma.driverVehicle.deleteMany({ where: { driverId } });
    if (vehicleIds.length) {
      await prisma.driverVehicle.createMany({
        data: vehicleIds.map((vid) => ({ driverId: driverId!, vehicleId: vid })),
      });
    }
  }
  await log(id ? "DRIVER_UPDATED" : "DRIVER_CREATED", "Driver", driverId, name);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteDriver(id: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.driver.delete({ where: { id } }).catch(() => null);
  revalidatePath("/", "layout");
  return { ok: true };
}

// ───────────────────────── Packages ─────────────────────────

export async function savePackage(raw: Record<string, unknown>, id?: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  const name = String(raw.name || "").trim();
  if (name.length < 2) return { ok: false, error: "Package name is required." };
  const places = String(raw.placesCovered || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const itinerary = String(raw.itinerary || "")
    .split(/[\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const images = String(raw.images || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const vehicleIds = Array.isArray(raw.vehicleIds) ? (raw.vehicleIds as string[]) : [];

  const data = {
    name,
    destination: String(raw.destination || "").trim(),
    startingLocation: String(raw.startingLocation || "Shivamogga").trim(),
    durationDays: Number(raw.durationDays || 1),
    placesCovered: JSON.stringify(places),
    itinerary: JSON.stringify(itinerary),
    description: String(raw.description || "").trim() || null,
    pricingType: (String(raw.pricingType || "CONTACT")) as any,
    price: raw.price ? Number(raw.price) : null,
    perPersonPrice: raw.perPersonPrice ? Number(raw.perPersonPrice) : null,
    vehicleIds: JSON.stringify(vehicleIds),
    active: raw.active !== "false" && raw.active !== false,
    featured: raw.featured === "true" || raw.featured === true,
  };

  let packageId = id;
  if (id) {
    await prisma.package.update({ where: { id }, data });
  } else {
    const pkg = await prisma.package.create({
      data: { ...data, slug: await uniquePackageSlug(slugify(name)) },
    });
    packageId = pkg.id;
  }
  if (packageId && images.length) {
    await prisma.packageImage.deleteMany({ where: { packageId } });
    await prisma.packageImage.createMany({
      data: images.map((url, i) => ({ packageId: packageId!, url, sortOrder: i })),
    });
  }
  await log(id ? "PACKAGE_UPDATED" : "PACKAGE_CREATED", "Package", packageId, name);
  revalidatePath("/", "layout");
  return { ok: true };
}

async function uniquePackageSlug(base: string): Promise<string> {
  let slug = base || "package";
  let i = 2;
  while (await prisma.package.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function deletePackage(id: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.package.delete({ where: { id } }).catch(() => null);
  revalidatePath("/", "layout");
  return { ok: true };
}

// ───────────────────────── Gallery ─────────────────────────

export async function saveGalleryItem(
  raw: Record<string, unknown>,
  id?: string,
): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  const url = String(raw.url || "").trim();
  if (!url) return { ok: false, error: "Image URL is required." };
  const data = {
    title: String(raw.title || "").trim() || null,
    category: String(raw.category || "Trips").trim(),
    url,
    sortOrder: Number(raw.sortOrder || 0),
  };
  if (id) {
    await prisma.galleryItem.update({ where: { id }, data });
  } else {
    await prisma.galleryItem.create({ data });
  }
  revalidatePath("/gallery");
  return { ok: true };
}

export async function deleteGalleryItem(id: string): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await prisma.galleryItem.delete({ where: { id } }).catch(() => null);
  revalidatePath("/gallery");
  return { ok: true };
}

// ───────────────────────── Settings ─────────────────────────

export async function saveSettings(raw: Record<string, unknown>): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  const phones = String(raw.phones || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  await updateSettings({
    businessName: String(raw.businessName || "Balaji Holidays Travels"),
    tagline: String(raw.tagline || ""),
    address: String(raw.address || ""),
    phones: phones.length ? phones : ["8880555522"],
    email: String(raw.email || ""),
    instagram: String(raw.instagram || ""),
    whatsappNumber: String(raw.whatsappNumber || ""),
    whatsappMessage: String(raw.whatsappMessage || ""),
    heroTitle: String(raw.heroTitle || ""),
    heroSubtitle: String(raw.heroSubtitle || ""),
    aboutText: String(raw.aboutText || ""),
    seoTitle: String(raw.seoTitle || ""),
    seoDescription: String(raw.seoDescription || ""),
    footerText: String(raw.footerText || ""),
    distanceMode: (String(raw.distanceMode || "both")) as any,
    showPricePerKmGlobal: raw.showPricePerKmGlobal !== "false" && raw.showPricePerKmGlobal !== false,
    autoDoubleReturn: raw.autoDoubleReturn === "true" || raw.autoDoubleReturn === true,
    mapEmbedUrl: String(raw.mapEmbedUrl || ""),
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveAbout(raw: Record<string, unknown>): Promise<AdminResult> {
  const admin = await guard();
  if (!admin) return { ok: false, error: "Unauthorized" };
  await updateSettings({ aboutText: String(raw.aboutText || "") });
  revalidatePath("/about");
  return { ok: true };
}
