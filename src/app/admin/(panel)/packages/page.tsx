import { prisma } from "@/lib/db";
import { PackageManager } from "@/components/admin/package-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Packages — Admin" };

export default async function AdminPackagesPage() {
  const [packages, vehicles] = await Promise.all([
    prisma.package.findMany({ include: { images: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } }),
    prisma.vehicle.findMany({ orderBy: { capacity: "desc" } }),
  ]);

  return (
    <PackageManager
      packages={packages.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        destination: p.destination,
        startingLocation: p.startingLocation,
        durationDays: p.durationDays,
        placesCovered: p.placesCovered || "[]",
        itinerary: p.itinerary || "[]",
        description: p.description,
        pricingType: p.pricingType,
        price: p.price,
        perPersonPrice: p.perPersonPrice,
        vehicleIds: p.vehicleIds || "[]",
        active: p.active,
        featured: p.featured,
        images: p.images.map((i) => ({ url: i.url })),
      }))}
      vehicles={vehicles.map((v) => ({ id: v.id, name: v.name }))}
      vehicleIdsByPackage={{}}
    />
  );
}
