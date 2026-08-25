import { prisma } from "@/lib/db";

/** Generates sequential booking IDs like BH-2026-00001 */
export async function nextBookingId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BH-${year}-`;
  const count = await prisma.booking.count({
    where: { bookingId: { startsWith: prefix } },
  });
  const next = count + 1;
  return `${prefix}${String(next).padStart(5, "0")}`;
}
