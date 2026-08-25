import { prisma } from "@/lib/db";
import { VehicleManager } from "@/components/admin/vehicle-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vehicles — Admin" };

export default async function AdminVehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    include: { pricing: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { capacity: "desc" },
  });

  const rows = vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    type: v.type,
    capacity: v.capacity,
    ac: v.ac,
    status: v.status,
    active: v.active,
    showPricePerKm: v.showPricePerKm,
    description: v.description,
    features: v.features || "[]",
    images: v.images.map((i) => ({ url: i.url })),
    pricing: v.pricing
      ? {
          pricePerKm: v.pricing.pricePerKm,
          minBillingKm: v.pricing.minBillingKm,
          minKmPerDay: v.pricing.minKmPerDay,
        }
      : null,
  }));

  return <VehicleManager vehicles={rows} />;
}
