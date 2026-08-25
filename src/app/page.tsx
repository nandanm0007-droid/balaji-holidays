import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatINR } from "@/lib/utils";
import { whatsappLink, telLink } from "@/lib/links";
import { VEHICLE_TYPE_LABELS, VEHICLE_STATUS_LABELS } from "@/lib/constants";
import { HeroEstimateCard } from "@/components/home/quick-calculator";
import { Badge } from "@/components/ui/badge";
import {
  Bus,
  Users,
  Clock,
  Phone,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Luggage,
  Route,
  ArrowRight,
  Calendar,
  Star,
  Check,
  Train,
  Plane,
} from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const vehicles = await prisma.vehicle.findMany({
    where: { active: true },
    include: { pricing: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { capacity: "desc" },
    take: 6,
  });
  const packages = await prisma.package.findMany({
    where: { active: true },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { featured: "desc" },
    take: 3,
  });

  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-navy-gradient text-white">
        <img
          src="/images/hero.jpg"
          alt="Balaji Holidays vehicles ready for your journey"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/95 to-navy-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/40" />
        <div aria-hidden className="absolute inset-0 bg-radial-gold" />

        <div className="container-px relative grid grid-cols-1 items-center gap-12 py-20 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-28">
          {/* copy */}
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold-300">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              24 Hours Service · Train & Flight Booking · All Vehicles
            </span>

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              Travel Comfortably. <span className="text-gradient-gold">Explore Freely.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-200">
              {settings.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/book" className="btn-gold btn-shine !px-7 !py-3 text-base">
                Book a Vehicle
              </Link>
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-ring backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20 active:scale-[0.98]"
              >
                <Calendar className="h-5 w-5" /> Calculate Trip Price
              </Link>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:gap-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Call us — anytime
                </p>
                <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1">
                  {settings.phones.map((p) => (
                    <a
                      key={p}
                      href={telLink(p)}
                      className="flex items-center gap-1.5 font-display text-base font-semibold text-white transition-colors hover:text-gold-300"
                    >
                      <Phone className="h-4 w-4 text-gold-400" /> {p}
                    </a>
                  ))}
                </div>
              </div>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp !px-4 !py-2.5"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp Us
              </a>
            </div>
          </div>

          {/* estimate card */}
          <div className="relative lg:justify-self-end lg:pl-4">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 hidden h-32 w-32 rounded-full bg-gold-400/15 blur-2xl lg:block"
            />
            <div className="animate-slide-up [animation-delay:120ms]">
              <HeroEstimateCard />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Highlights ─── */}
      <section className="container-px relative z-10 -mt-10 sm:-mt-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-5">
          {[
            {
              icon: Bus,
              title: "All Types of Vehicles",
              text: "Buses, Tempo Travellers, Innova and more — 7 to 50 seaters.",
            },
            {
              icon: Train,
              title: "Train Booking",
              text: "Hassle-free train ticket booking across India.",
            },
            {
              icon: Plane,
              title: "Flight Booking",
              text: "Domestic & international flight booking assistance.",
            },
            {
              icon: Sparkles,
              title: "Package Trips Available",
              text: "Curated local & outstation packages across Karnataka.",
            },
            {
              icon: Clock,
              title: "24 Hours Service",
              text: "Round-the-clock booking, support and on-road assistance.",
            },
          ].map((h) => (
            <div
              key={h.title}
              className="card-hover flex items-start gap-4 p-5 sm:p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-gradient text-gold-300 shadow-soft ring-1 ring-inset ring-gold-400/20">
                <h.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display font-bold text-navy-900">{h.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{h.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Fleet preview ─── */}
      <section className="py-16 sm:py-20">
        <div className="container-px">
          <div className="mb-8 flex items-end justify-between sm:mb-10">
            <div>
              <h2 className="section-title">Our Fleet</h2>
              <p className="section-subtitle !mt-1.5">
                Compare vehicles, capacity and estimated pricing.
              </p>
            </div>
            <Link href="/vehicles" className="btn-outline hidden sm:inline-flex">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <Link
                key={v.id}
                href={`/vehicles/${v.slug}`}
                className="card-hover group overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden bg-slate-200">
                  {v.images[0] ? (
                    <img
                      src={v.images[0].url}
                      alt={v.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Bus className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
                  <Badge
                    tone={v.status === "AVAILABLE" ? "green" : "red"}
                    className="absolute left-3 top-3 backdrop-blur-sm"
                  >
                    {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS]}
                  </Badge>
                  {v.showPricePerKm && v.pricing && (
                    <div className="absolute bottom-3 left-3 rounded-full bg-navy-950/70 px-3 py-1 text-xs font-semibold text-gold-300 backdrop-blur-sm">
                      From {formatINR(v.pricing.pricePerKm)}/km
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-navy-900">{v.name}</h3>
                    <Badge tone="navy">
                      {VEHICLE_TYPE_LABELS[v.type as keyof typeof VEHICLE_TYPE_LABELS]}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-slate-400" /> {v.capacity} seats
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-slate-400" /> {v.ac ? "AC" : "Non-AC"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-navy-800 transition-colors group-hover:text-gold-600">
                    View details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/vehicles" className="btn-outline w-full">
              View All Vehicles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Packages preview ─── */}
      {packages.length > 0 && (
        <section className="relative overflow-hidden bg-navy-gradient py-16 text-white sm:py-20">
          <div aria-hidden className="absolute inset-0 bg-radial-white" />
          <div className="container-px relative">
            <div className="mb-8 flex items-end justify-between sm:mb-10">
              <div>
                <span className="eyebrow-dark">Curated Journeys</span>
                <h2 className="section-title !text-white">Package Trips</h2>
                <p className="section-subtitle !mt-1.5 !text-slate-300">
                  Popular curated journeys from Shivamogga.
                </p>
              </div>
              <Link href="/packages" className="btn-gold hidden sm:inline-flex">
                All Packages <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {packages.map((p) => (
                <Link
                  key={p.id}
                  href={`/packages/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-ring transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/40 hover:bg-white/[0.07]"
                >
                  <div className="relative h-48 overflow-hidden">
                    {p.images[0] && (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent" />
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-navy-950/80 px-2.5 py-1 text-xs font-semibold text-gold-300 backdrop-blur-sm">
                      <Calendar className="h-3 w-3" /> {p.durationDays} day{p.durationDays > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-white">{p.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                      <Route className="h-3.5 w-3.5 text-gold-400" /> {p.destination}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-gold-300">
                      Enquire now{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Why choose us ─── */}
      <section className="py-16 sm:py-20">
        <div className="container-px">
          <div className="mb-8 text-center sm:mb-12">
            <span className="eyebrow">Why Balaji Holidays</span>
            <h2 className="section-title mt-3">Travel With Complete Peace of Mind</h2>
            <p className="section-subtitle mx-auto">
              Every journey is backed by dependable vehicles, experienced drivers and
              round-the-clock support.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: ShieldCheck, title: "Trusted Service", text: "Reliable vehicles and experienced drivers for safe journeys." },
              { icon: Luggage, title: "All Vehicle Types", text: "From 7-seater Innovas to 50-seater luxury buses." },
              { icon: Train, title: "Train Booking", text: "Easy train ticket booking for journeys across India." },
              { icon: Plane, title: "Flight Booking", text: "Domestic & international flight booking assistance." },
              { icon: Route, title: "Custom Trips", text: "Local, outstation and fully customized itineraries." },
              { icon: Clock, title: "24×7 Support", text: "Book anytime — we're available around the clock." },
            ].map((f) => (
              <div key={f.title} className="card-hover p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-800 ring-1 ring-inset ring-navy-100">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display font-bold text-navy-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{f.text}</p>
              </div>
            ))}
          </div>

          {/* quick reassurance row */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              "No online payment — final price confirmed by phone",
              "Transparent estimated pricing before you book",
              "Verified, courteous drivers for every trip",
            ].map((s) => (
              <div
                key={s}
                className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-800"
              >
                <Check className="h-4 w-4 shrink-0 text-emerald-600" /> {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA band ─── */}
      <section className="relative overflow-hidden bg-gold-gradient py-14">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl"
        />
        <div className="container-px relative flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-navy-950 sm:text-3xl">
              Planning a trip? Get an estimated price now.
            </h2>
            <p className="mt-1 font-medium text-navy-900/80">
              Estimated prices only — the final fare will be confirmed by Balaji Holidays.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 rounded-xl bg-navy-950 px-6 py-3 font-semibold text-white shadow-soft-lg transition-all hover:-translate-y-0.5 hover:bg-navy-900 active:scale-[0.98]"
            >
              <Calendar className="h-5 w-5" /> Calculate Price
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-navy-950/20 bg-white/70 px-6 py-3 font-semibold text-navy-950 backdrop-blur-sm transition-all hover:bg-white active:scale-[0.98]"
            >
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}