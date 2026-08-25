import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatINR, parseJSON } from "@/lib/utils";
import { VEHICLE_TYPE_LABELS, VEHICLE_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { VehiclePriceCalculator } from "@/components/vehicles/vehicle-price-calculator";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/links";
import { Users, Snowflake, Check, Phone, MessageCircle } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const v = await prisma.vehicle.findUnique({ where: { slug: params.slug } });
  return {
    title: v ? `${v.name} — Vehicle Rental Shivamogga` : "Vehicle",
    description: v?.description?.slice(0, 160) ?? undefined,
  };
}

export default async function VehicleDetailPage({ params }: { params: { slug: string } }) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug: params.slug },
    include: { pricing: true, images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!vehicle || !vehicle.active) notFound();

  const settings = await getSettings();
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const features = parseJSON<string[]>(vehicle.features, []);
  const p = vehicle.pricing;

  return (
    <div>
      <div className="container-px py-10">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/vehicles" className="hover:text-navy-700">Vehicles</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-900">{vehicle.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* images */}
          <div >
              <div className="relative overflow-hidden rounded-2xl bg-slate-200 shadow-soft">
                {vehicle.images[0] ? (
                  <img
                    src={vehicle.images[0].url}
                    alt={vehicle.name}
                    className="h-72 w-full object-cover sm:h-96"
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center text-slate-400 sm:h-96">No image</div>
                )}
              </div>
            {vehicle.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {vehicle.images.map((img, i) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={img.alt || `${vehicle.name} ${i + 1}`}
                    className="h-20 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* details */}
          <div>
            <div className="flex items-center gap-3">
              <Badge tone="navy">{VEHICLE_TYPE_LABELS[vehicle.type as keyof typeof VEHICLE_TYPE_LABELS]}</Badge>
              <Badge tone={vehicle.status === "AVAILABLE" ? "green" : "red"}>
                {VEHICLE_STATUS_LABELS[vehicle.status as keyof typeof VEHICLE_STATUS_LABELS]}
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-navy-900">{vehicle.name}</h1>

            <div className="mt-4 flex flex-wrap gap-6 text-slate-700">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-navy-500" />
                <strong>{vehicle.capacity}</strong> seats
              </span>
              <span className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-navy-500" /> {vehicle.ac ? "AC" : "Non-AC"}
              </span>
              {p && (
                <span className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Min billing</span>
                  <strong>{p.minBillingKm || 0} km</strong>
                </span>
              )}
            </div>

            {p && vehicle.showPricePerKm && (
              <div className="relative mt-5 overflow-hidden rounded-2xl border border-gold-200 bg-gold-50 p-5">
                <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gold-gradient" />
                <p className="text-sm font-semibold uppercase tracking-wider text-gold-800">
                  Starting from
                </p>
                <p className="font-display text-3xl font-extrabold text-navy-900">
                  {formatINR(p.pricePerKm)}
                  <span className="text-base font-medium text-slate-500"> /km</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Estimated pricing — final fare confirmed by Balaji Holidays.
                </p>
              </div>
            )}

            {vehicle.description && (
              <p className="mt-5 leading-relaxed text-slate-600">{vehicle.description}</p>
            )}

            {features.length > 0 && (
              <div className="mt-5">
                <h2 className="font-semibold text-navy-900">Features</h2>
                <ul className="mt-2 grid grid-cols-2 gap-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/book?vehicle=${vehicle.slug}`} className="btn-gold">
                Book Now
              </Link>
              <Link href={`/enquiry?vehicle=${vehicle.slug}`} className="btn-outline">
                Make an Enquiry
              </Link>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href={`tel:${settings.phones[0]}`} className="btn-outline">
                <Phone className="h-4 w-4" /> Call
              </a>
            </div>
          </div>
        </div>

        {/* calculator */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <VehiclePriceCalculator
            vehicleId={vehicle.id}
            vehicleSlug={vehicle.slug}
            vehicleName={vehicle.name}
          />
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-bold text-navy-900">Why book this vehicle?</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500" /> Clean &amp; well-maintained vehicles
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500" /> Experienced, verified drivers
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500" /> 24 hours service &amp; support
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500" /> Transparent estimated pricing
                </li>
              </ul>
            </div>
            <div className="relative card overflow-hidden border-transparent bg-navy-gradient p-5 text-white">
              <div aria-hidden className="absolute inset-0 bg-radial-gold" />
              <div className="relative">
                <h3 className="font-display font-bold text-white">Questions about this vehicle?</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Call Balaji Holidays — we're available 24 hours.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {settings.phones.map((ph) => (
                    <a key={ph} href={`tel:${ph}`} className="btn-on-dark !px-3.5 !py-2 text-sm">
                      <Phone className="h-4 w-4" /> {ph}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
