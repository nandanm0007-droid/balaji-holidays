import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatINR, formatDate, relativeTime } from "@/lib/utils";
import { BOOKING_STATUS_LABELS, ENQUIRY_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { MapPin, Calendar, Users, Route, Phone, Mail } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export const metadata = { title: "My Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      bookings: { include: { vehicle: true, driver: true }, orderBy: { createdAt: "desc" } },
      enquiries: { orderBy: { createdAt: "desc" } },
      packageEnquiries: { include: { package: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) redirect("/login");

  const now = new Date();
  const upcoming = user.bookings.filter(
    (b) => new Date(b.travelDate) >= now && !["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status),
  );
  const previous = user.bookings.filter(
    (b) => new Date(b.travelDate) < now || ["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status),
  );

  return (
    <div className="bg-slate-100">
      <div className="relative overflow-hidden bg-navy-gradient py-10 text-white">
        <div aria-hidden className="absolute inset-0 bg-radial-gold" />
        <div className="container-px relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">My Dashboard</h1>
            <p className="text-slate-300">Welcome, {user.name || user.phone}</p>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="container-px py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* profile */}
          <div className="space-y-6">
            <div className="card p-5">
              <h2 className="font-bold text-navy-900">Profile</h2>
              <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                <Phone className="h-4 w-4" /> {user.phone}
              </p>
              <ProfileForm initialName={user.name} initialEmail={user.email} />
            </div>

            <div className="card p-5">
              <h2 className="font-bold text-navy-900">Quick Actions</h2>
              <div className="mt-3 flex flex-col gap-2">
                <Link href="/calculator" className="btn-primary !justify-start">Calculate Trip Price</Link>
                <Link href="/book" className="btn-gold !justify-start">Book a Vehicle</Link>
                <Link href="/enquiry" className="btn-outline !justify-start">Make an Enquiry</Link>
              </div>
            </div>
          </div>

          {/* bookings */}
          <div className="lg:col-span-2">
            <section>
              <h2 className="text-lg font-bold text-navy-900">Upcoming Trips</h2>
              {upcoming.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  No upcoming trips. <Link href="/book" className="text-navy-700 underline">Book now →</Link>
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {upcoming.map((b) => (
                    <BookingCard key={b.id} b={b} />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8">
              <h2 className="text-lg font-bold text-navy-900">Previous Trips</h2>
              {previous.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No previous trips.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {previous.map((b) => (
                    <BookingCard key={b.id} b={b} />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8">
              <h2 className="text-lg font-bold text-navy-900">My Enquiries</h2>
              {user.enquiries.length === 0 && user.packageEnquiries.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No enquiries yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {user.enquiries.map((e) => (
                    <div key={e.id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-navy-900">{e.subject || "General enquiry"}</p>
                        <Badge tone={statusTone(e.status)}>{ENQUIRY_STATUS_LABELS[e.status as keyof typeof ENQUIRY_STATUS_LABELS]}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{e.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{relativeTime(e.createdAt)}</p>
                    </div>
                  ))}
                  {user.packageEnquiries.map((e) => (
                    <div key={e.id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-navy-900">
                          Package: {e.package?.name ?? "Package enquiry"}
                        </p>
                        <Badge tone={statusTone(e.status)}>{ENQUIRY_STATUS_LABELS[e.status as keyof typeof ENQUIRY_STATUS_LABELS]}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{relativeTime(e.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusTone(s: string) {
  switch (s) {
    case "CONFIRMED":
    case "COMPLETED":
    case "CONVERTED":
      return "green" as const;
    case "REJECTED":
    case "CANCELLED":
    case "CLOSED":
      return "red" as const;
    case "NEW":
    case "PENDING":
      return "blue" as const;
    case "UNDER_REVIEW":
    case "FOLLOWUP":
    case "CONTACTED":
      return "amber" as const;
    default:
      return "slate" as const;
  }
}

function BookingCard({ b }: { b: any }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-navy-900">{b.bookingId}</p>
            <Badge tone={statusTone(b.status)}>
              {BOOKING_STATUS_LABELS[b.status as keyof typeof BOOKING_STATUS_LABELS]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {b.vehicle.name} · {b.vehicle.capacity} seats{b.driver ? ` · Driver: ${b.driver.name}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Estimated price</p>
          <p className="text-lg font-extrabold text-navy-900">{formatINR(b.estimatedPrice)}</p>
          {b.finalPrice != null && (
            <p className="text-xs text-slate-500">Final: <span className="font-semibold">{formatINR(b.finalPrice)}</span></p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
        <span className="flex items-center gap-1"><Route className="h-4 w-4 text-slate-400" /> {b.pickup} → {b.destination}</span>
        <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-slate-400" /> {formatDate(b.travelDate)}</span>
        <span className="flex items-center gap-1"><Users className="h-4 w-4 text-slate-400" /> {b.passengers} pax</span>
        <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-slate-400" /> {b.distanceKm} km</span>
      </div>
    </div>
  );
}
