import { prisma } from "@/lib/db";
import { PricingManager } from "@/components/admin/pricing-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pricing — Admin" };

export default async function AdminPricingPage() {
  const vehicles = await prisma.vehicle.findMany({
    include: { pricing: true },
    orderBy: { capacity: "desc" },
  });

  const rows = vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    capacity: v.capacity,
    p: v.pricing
      ? {
          pricePerKm: v.pricing.pricePerKm,
          minBillingKm: v.pricing.minBillingKm,
          minKmPerDay: v.pricing.minKmPerDay,
          driverAllowancePerDay: v.pricing.driverAllowancePerDay,
          driverAllowanceEnabled: v.pricing.driverAllowanceEnabled,
          tollEnabled: v.pricing.tollEnabled,
          tollCharge: v.pricing.tollCharge,
          parkingEnabled: v.pricing.parkingEnabled,
          parkingCharge: v.pricing.parkingCharge,
          permitEnabled: v.pricing.permitEnabled,
          permitCharge: v.pricing.permitCharge,
          nightEnabled: v.pricing.nightEnabled,
          nightCharge: v.pricing.nightCharge,
          waitingEnabled: v.pricing.waitingEnabled,
          waitingChargePerHour: v.pricing.waitingChargePerHour,
          fixedEnabled: v.pricing.fixedEnabled,
          fixedCharge: v.pricing.fixedCharge,
          seasonalEnabled: v.pricing.seasonalEnabled,
          seasonalChargePct: v.pricing.seasonalChargePct,
        }
      : {
          pricePerKm: 0, minBillingKm: 0, minKmPerDay: 0, driverAllowancePerDay: 0,
          driverAllowanceEnabled: false, tollEnabled: false, tollCharge: 0, parkingEnabled: false,
          parkingCharge: 0, permitEnabled: false, permitCharge: 0, nightEnabled: false,
          nightCharge: 0, waitingEnabled: false, waitingChargePerHour: 0, fixedEnabled: false,
          fixedCharge: 0, seasonalEnabled: false, seasonalChargePct: 0,
        },
  }));

  return <PricingManager rows={rows} />;
}
