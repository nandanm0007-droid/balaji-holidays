import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatINR, parseJSON } from "@/lib/utils";
import { VEHICLE_TYPE_LABELS, VEHICLE_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Bus, Users, Snowflake, Check, ArrowRight } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vehicles & Fleet — Bus, Tempo Traveller, Innova Rental",
  description:
    "Explore the Balaji Holidays fleet — 50-seater, 46-seater, 20-seater buses, Tempo Traveller and Innova for rental in Shivamogga.",
};

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: { active: true },
    include: { pricing: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { capacity: "desc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Our Fleet"
        title="Vehicles For Every Journey"
        subtitle="All types of vehicles available — from comfortable 7-seater Innovas to 50-seater luxury buses. Compare capacity, features and estimated pricing."
      />

      <div className="container-px py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="card-hover group flex flex-col overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden bg-slate-200">
                {v.images[0] ? (
                  <img
                    src={v.images[0].url}
                    alt={v.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-navy-50 text-slate-400">
                    <Bus className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
                <Badge
                  tone={v.status === "AVAILABLE" ? "green" : "red"}
                  className="absolute left-3 top-3 backdrop-blur-sm"
                >
                  {VEHICLE_STATUS_LABELS[v.status as keyof typeof VEHICLE_STATUS_LABELS]}
                </Badge>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-navy-900">{v.name}</h2>
                  <Badge tone="navy">
                    {VEHICLE_TYPE_LABELS[v.type as keyof typeof VEHICLE_TYPE_LABELS]}
                  </Badge>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-slate-400" /> {v.capacity} seats
                  </span>
                  <span className="flex items-center gap-1">
                    <Snowflake className="h-4 w-4 text-slate-400" /> {v.ac ? "AC" : "Non-AC"}
                  </span>
                </div>

                {v.features && parseJSON<string[]>(v.features, []).length > 0 && (
                  <ul className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1">
                    {parseJSON<string[]>(v.features, [])
                      .slice(0, 4)
                      .map((f) => (
                        <li key={f} className="flex items-center gap-1 text-xs text-slate-500">
                          <Check className="h-3 w-3 text-emerald-500" /> {f}
                        </li>
                      ))}
                  </ul>
                )}

                {v.showPricePerKm && v.pricing && (
                  <p className="mt-3 text-sm">
                    <span className="text-slate-500">From </span>
                    <span className="font-display text-lg font-bold text-navy-900">
                      {formatINR(v.pricing.pricePerKm)}
                    </span>
                    <span className="text-slate-500"> /km</span>
                  </p>
                )}

                <div className="mt-auto flex gap-2 pt-4">
                  <Link href={`/vehicles/${v.slug}`} className="btn-outline flex-1 !px-3 text-sm">
                    View Details
                  </Link>
                  <Link
                    href={`/book?vehicle=${v.slug}`}
                    className="btn-gold flex-1 !px-3 text-sm"
                  >
                    Book Now
                  </Link>
                </div>
                <Link
                  href={`/calculator`}
                  className="mt-2.5 flex items-center justify-center gap-1 text-xs font-medium text-navy-700 transition-colors hover:text-gold-600 hover:underline"
                >
                  Calculate price <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {vehicles.length === 0 && (
          <div className="card p-10 text-center text-slate-500">
            No vehicles available right now. Please contact Balaji Holidays.
          </div>
        )}
      </div>
    </div>
  );
}