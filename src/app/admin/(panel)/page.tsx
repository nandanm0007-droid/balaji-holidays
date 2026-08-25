import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  MessageCircle,
  Bus,
  Wrench,
  Users,
  Route,
  Bell,
} from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    totalEnquiries,
    availableVehicles,
    onTripVehicles,
    maintenanceVehicles,
    totalCustomers,
    bookings,
    vehicles,
    packageEnquiries,
    notifications,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW"] } } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.enquiry.count(),
    prisma.vehicle.count({ where: { active: true, status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
    prisma.vehicle.count({ where: { status: "MAINTENANCE" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.booking.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.vehicle.findMany({ include: { bookings: true } }),
    prisma.packageEnquiry.count(),
    prisma.notification.findMany({
      where: { type: "BOOKING_CREATED" },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  // Bookings by month (last 6 months)
  const months: { label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = bookings.filter((b) => b.createdAt >= d && b.createdAt < next).length;
    months.push({ label: d.toLocaleDateString("en-IN", { month: "short" }), count });
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.count));

  // Vehicle usage
  const usage = vehicles
    .map((v) => ({ name: v.name, count: v.bookings.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxUsage = Math.max(1, ...usage.map((u) => u.count));

  const stats = [
    { label: "Total Booking Requests", value: totalBookings, icon: ClipboardList, href: "/admin/bookings" },
    { label: "Pending Requests", value: pendingBookings, icon: Clock, href: "/admin/bookings" },
    { label: "Confirmed Bookings", value: confirmedBookings, icon: CheckCircle2, href: "/admin/bookings" },
    { label: "Total Enquiries", value: totalEnquiries + packageEnquiries, icon: MessageCircle, href: "/admin/enquiries" },
    { label: "Available Vehicles", value: availableVehicles, icon: Bus, href: "/admin/vehicles" },
    { label: "Vehicles on Trip", value: onTripVehicles, icon: Route, href: "/admin/vehicles" },
    { label: "Maintenance Vehicles", value: maintenanceVehicles, icon: Wrench, href: "/admin/vehicles" },
    { label: "Total Customers", value: totalCustomers, icon: Users, href: "/admin/bookings" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">Dashboard</h1>
      <p className="text-sm text-slate-500">Overview of bookings, vehicles and enquiries.</p>

      <section className="card mt-6 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gold-600" />
            <h2 className="font-bold text-navy-900">Booking notifications</h2>
          </div>
          <Link href="/admin/bookings" className="text-sm font-semibold text-navy-700 hover:underline">View bookings</Link>
        </div>
        {notifications.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No booking notifications yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-navy-900">{notification.title}</p>
                  <span className="shrink-0 text-xs text-slate-400">{notification.createdAt.toLocaleString("en-IN")}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{s.label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-gradient text-gold-300 shadow-soft ring-1 ring-inset ring-gold-400/20">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold text-navy-900">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* bookings by month */}
        <div className="card p-5">
          <h2 className="font-bold text-navy-900">Bookings by Month (last 6 months)</h2>
          <div className="mt-4 flex h-40 items-end gap-3">
            {months.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-navy-800">{m.count}</span>
                <div
                  className="w-full rounded-t-md bg-navy-700 transition-all"
                  style={{ height: `${(m.count / maxMonth) * 100}%`, minHeight: m.count ? 6 : 2 }}
                />
                <span className="text-xs text-slate-500">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* vehicle usage */}
        <div className="card p-5">
          <h2 className="font-bold text-navy-900">Vehicle Usage (total bookings)</h2>
          <div className="mt-4 space-y-3">
            {usage.length === 0 && <p className="text-sm text-slate-500">No bookings yet.</p>}
            {usage.map((u) => (
              <div key={u.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{u.name}</span>
                  <span className="font-semibold text-navy-900">{u.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gold-500"
                    style={{ width: `${(u.count / maxUsage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
