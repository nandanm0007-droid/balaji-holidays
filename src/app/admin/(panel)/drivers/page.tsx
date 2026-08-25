import { prisma } from "@/lib/db";
import { DriverManager } from "@/components/admin/driver-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Drivers — Admin" };

export default async function AdminDriversPage() {
  const [drivers, vehicles, links] = await Promise.all([
    prisma.driver.findMany({ orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { capacity: "desc" } }),
    prisma.driverVehicle.findMany(),
  ]);

  const vehicleIdsByDriver: Record<string, string[]> = {};
  for (const l of links) {
    (vehicleIdsByDriver[l.driverId] ||= []).push(l.vehicleId);
  }

  return (
    <DriverManager
      drivers={drivers.map((d) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        photoUrl: d.photoUrl,
        experienceYears: d.experienceYears,
        languages: d.languages || "[]",
        bio: d.bio,
        rating: d.rating,
        active: d.active,
        available: d.available,
      }))}
      vehicles={vehicles.map((v) => ({ id: v.id, name: v.name }))}
      vehicleIdsByDriver={vehicleIdsByDriver}
    />
  );
}
