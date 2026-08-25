import { prisma } from "@/lib/db";
import { BookingManager } from "@/components/admin/booking-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings — Admin" };

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status || "ALL";
  const where =
    status && status !== "ALL" ? { status: status as any } : {};

  const bookings = await prisma.booking.findMany({
    where,
    include: { vehicle: true, driver: true },
    orderBy: { createdAt: "desc" },
  });
  const drivers = await prisma.driver.findMany({ orderBy: { name: "asc" } });

  const rows = bookings.map((b) => ({
    id: b.id,
    bookingId: b.bookingId,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    customerEmail: b.customerEmail,
    vehicleName: b.vehicle.name,
    vehicleId: b.vehicleId,
    driverId: b.driverId,
    driverName: b.driver?.name ?? null,
    pickup: b.pickup,
    destination: b.destination,
    travelDate: b.travelDate.toISOString(),
    returnDate: b.returnDate?.toISOString() ?? null,
    tripType: b.tripType,
    passengers: b.passengers,
    distanceKm: b.distanceKm,
    estimatedPrice: b.estimatedPrice,
    finalPrice: b.finalPrice,
    status: b.status,
    adminNotes: b.adminNotes,
    customerNotes: b.customerNotes,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <BookingManager
      bookings={rows}
      drivers={drivers.map((d) => ({ id: d.id, name: d.name }))}
      statusFilter={status}
    />
  );
}
