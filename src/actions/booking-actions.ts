"use server";

import { prisma } from "@/lib/db";
import { getSession, setSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { calculateEstimate } from "@/lib/pricing";
import { nextBookingId } from "@/lib/booking-id";
import { isVehicleBookedForDates } from "@/actions/trip-actions";
import { bookingSchema } from "@/lib/validation";
import { sendBookingEmailToAdmin, sendBookingConfirmationToCustomer } from "@/lib/email";
import { revalidatePath } from "next/cache";

export type BookingResult = {
  ok: boolean;
  error?: string;
  bookingId?: string;
  booking?: {
    bookingId: string;
    vehicleName: string;
    capacity: number;
    driverName: string | null;
    pickup: string;
    destination: string;
    distanceKm: number;
    estimatedPrice: number;
    travelDate: string;
    returnDate: string | null;
    passengers: number;
    status: string;
  };
};

export async function createBooking(raw: Record<string, unknown>): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const data = parsed.data;

  let session = await getSession();
  if (!session) {
    let user = await prisma.user.findUnique({ where: { phone: data.customerPhone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone: data.customerPhone, name: data.customerName.trim() || null },
      });
    } else if (data.customerName.trim() && !user.name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: data.customerName.trim() },
      });
    }
    session = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role as "CUSTOMER" | "ADMIN",
      email: user.email,
    };
    await setSession(session);
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
    include: { pricing: true },
  });
  if (!vehicle || !vehicle.active) {
    return { ok: false, error: "Please select a valid vehicle." };
  }

  const travelDate = new Date(data.travelDate);
  const returnDate = data.returnDate ? new Date(data.returnDate) : null;

  // Availability checks
  if (vehicle.status !== "AVAILABLE") {
    return { ok: false, error: "This vehicle is unavailable for the selected dates." };
  }
  const booked = await isVehicleBookedForDates(vehicle.id, travelDate, returnDate);
  if (booked) {
    return { ok: false, error: "This vehicle is unavailable for the selected dates." };
  }
  if (!vehicle.pricing || vehicle.pricing.pricePerKm <= 0) {
    return { ok: false, error: "Pricing is not configured for this vehicle. Please contact Balaji Holidays." };
  }

  // Driver validation
  let driverId: string | null = data.driverId || null;
  if (driverId) {
    const driver = await prisma.driver.findFirst({
      where: { id: driverId, active: true, available: true },
    });
    if (!driver) driverId = null;
  }

  const settings = await getSettings();
  const est = calculateEstimate(vehicle, vehicle.pricing, {
    oneWayDistanceKm: data.oneWayDistanceKm,
    tripType: data.tripType,
    travelDate,
    returnDate,
    autoDoubleReturn: settings.autoDoubleReturn,
  });

  const bookingId = await nextBookingId();

  const booking = await prisma.booking.create({
    data: {
      bookingId,
      userId: session.id,
      vehicleId: vehicle.id,
      driverId,
      pickup: data.pickup,
      destination: data.destination,
      travelDate,
      returnDate,
      tripType: data.tripType,
      passengers: data.passengers,
      tripDays: est.tripDays,
      oneWayDistanceKm: est.oneWayDistanceKm,
      distanceKm: est.totalDistanceKm,
      billableKm: est.billableKm,
      estimatedPrice: est.total,
      status: "PENDING",
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || null,
      customerNotes: data.customerNotes || null,
    },
    include: { vehicle: true, driver: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.id,
      actorName: session.name || session.phone,
      action: "BOOKING_CREATED",
      entity: "Booking",
      entityId: booking.id,
      details: `Booking ${bookingId} created (estimate ₹${est.total})`,
    },
  });

  await prisma.notification.create({
    data: {
      type: "BOOKING_CREATED",
      title: `New booking request: ${bookingId}`,
      message: `${booking.customerName} requested ${booking.vehicle.name} from ${booking.pickup} to ${booking.destination}.`,
    },
  });

  // Send email notifications (fire-and-forget — don't block the response)
  sendBookingEmailToAdmin({
    bookingId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail || null,
    vehicleName: booking.vehicle.name,
    pickup: booking.pickup,
    destination: booking.destination,
    travelDate,
    returnDate,
    tripType: data.tripType,
    passengers: data.passengers,
    distanceKm: booking.distanceKm,
    estimatedPrice: booking.estimatedPrice,
  }).catch((err) => console.error("Failed to send booking email to admin:", err));

  if (data.customerEmail) {
    sendBookingConfirmationToCustomer(
      { name: data.customerName, email: data.customerEmail },
      {
        bookingId,
        vehicleName: booking.vehicle.name,
        pickup: booking.pickup,
        destination: booking.destination,
        travelDate,
        returnDate,
        tripType: data.tripType,
        passengers: data.passengers,
        distanceKm: booking.distanceKm,
        estimatedPrice: booking.estimatedPrice,
      },
    ).catch((err) => console.error("Failed to send booking confirmation to customer:", err));
  }

  revalidatePath("/dashboard");

  return {
    ok: true,
    bookingId,
    booking: {
      bookingId: booking.bookingId,
      vehicleName: booking.vehicle.name,
      capacity: booking.vehicle.capacity,
      driverName: booking.driver?.name ?? null,
      pickup: booking.pickup,
      destination: booking.destination,
      distanceKm: booking.distanceKm,
      estimatedPrice: booking.estimatedPrice,
      travelDate: booking.travelDate.toISOString(),
      returnDate: booking.returnDate?.toISOString() ?? null,
      passengers: booking.passengers,
      status: booking.status,
    },
  };
}
