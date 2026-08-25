import Link from "next/link";
import { prisma } from "@/lib/db";
import { parseJSON } from "@/lib/utils";
import { packagePriceLabel } from "@/lib/package-price";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Route, Clock, MapPin, ArrowRight } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Package Trips — Shivamogga Tour Packages",
  description:
    "Curated package trips from Shivamogga — Chikmagalur, Jog Falls, Murudeshwara, Gokarna and more. Group and family travel packages by Balaji Holidays.",
};

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    where: { active: true },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        eyebrow="Curated Journeys"
        title="Package Trips"
        subtitle="Customized tour packages from Shivamogga — hill stations, temples, beaches and more. Every trip is planned around you."
      />

      <div className="container-px py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => {
            const places = parseJSON<string[]>(p.placesCovered, []);
            return (
              <div
                key={p.id}
                className="card-hover group flex flex-col overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden bg-slate-200">
                  {p.images[0] && (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-navy-950/80 px-2.5 py-1 text-xs font-semibold text-gold-300 backdrop-blur-sm">
                    <Clock className="h-3 w-3" /> {p.durationDays} day{p.durationDays > 1 ? "s" : ""}
                  </span>
                  {p.featured && (
                    <Badge tone="gold" className="absolute right-3 top-3">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-lg font-bold text-navy-900">{p.name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 text-gold-500" /> {p.destination}
                  </p>
                  {places.length > 0 && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {places.join(" · ")}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <p className="font-display font-semibold text-navy-900">{packagePriceLabel(p)}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link href={`/packages/${p.slug}`} className="btn-outline flex-1 !px-3 text-sm">
                      View Details
                    </Link>
                    <Link href={`/packages/${p.slug}#enquire`} className="btn-gold flex-1 !px-3 text-sm">
                      Enquire
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {packages.length === 0 && (
          <div className="card p-10 text-center text-slate-500">
            No packages right now. Please contact Balaji Holidays for customized trips.
          </div>
        )}

        <div className="relative mt-10 overflow-hidden rounded-2xl bg-navy-gradient p-6 text-white sm:p-8">
          <div aria-hidden className="absolute inset-0 bg-radial-gold" />
          <div className="relative flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div>
              <h3 className="font-display text-lg font-bold text-white sm:text-xl">
                Need a customized package?
              </h3>
              <p className="text-sm text-slate-300">
                Tell us your destination and dates — we'll build a trip for you.
              </p>
            </div>
            <Link href="/enquiry" className="btn-gold shrink-0">
              Make an Enquiry <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}