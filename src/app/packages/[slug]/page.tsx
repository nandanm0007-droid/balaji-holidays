import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseJSON } from "@/lib/utils";
import { packagePriceLabel } from "@/lib/package-price";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/links";
import { Badge } from "@/components/ui/badge";
import { PackageEnquiryForm } from "@/components/packages/package-enquiry-form";
import { Clock, MapPin, Check, Route, MessageCircle } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await prisma.package.findUnique({ where: { slug: params.slug } });
  return {
    title: p ? `${p.name} — Tour Package from Shivamogga` : "Package",
    description: p?.description?.slice(0, 160) ?? undefined,
  };
}

export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  const pkg = await prisma.package.findUnique({
    where: { slug: params.slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!pkg || !pkg.active) notFound();

  const settings = await getSettings();
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const places = parseJSON<string[]>(pkg.placesCovered, []);
  const itinerary = parseJSON<string[]>(pkg.itinerary, []);

  return (
    <div>
      <div className="container-px py-10">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/packages" className="hover:text-navy-700">Packages</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-900">{pkg.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="relative overflow-hidden rounded-2xl bg-slate-200 shadow-soft">
              {pkg.images[0] ? (
                <img src={pkg.images[0].url} alt={pkg.name} className="h-72 w-full object-cover sm:h-96" />
              ) : (
                <div className="flex h-72 items-center justify-center text-slate-400 sm:h-96">No image</div>
              )}
            </div>
            {pkg.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {pkg.images.map((img, i) => (
                  <img key={img.id} src={img.url} alt={pkg.name} className="h-20 w-full rounded-lg object-cover" />
                ))}
              </div>
            )}
          </div>

          <div>
            {pkg.featured && <Badge tone="gold" className="mb-2">Featured Package</Badge>}
            <h1 className="text-3xl font-extrabold text-navy-900">{pkg.name}</h1>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-slate-700">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-500" /> {pkg.destination}
              </span>
              <span className="flex items-center gap-2">
                <Route className="h-4 w-4 text-gold-500" /> From {pkg.startingLocation}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold-500" /> {pkg.durationDays} day{pkg.durationDays > 1 ? "s" : ""}
              </span>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-2xl border border-gold-200 bg-gold-50 p-5">
              <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gold-gradient" />
              <p className="text-sm font-semibold uppercase tracking-wider text-gold-800">Estimated price</p>
              <p className="font-display text-2xl font-extrabold text-navy-900">{packagePriceLabel(pkg)}</p>
              <p className="mt-1 text-xs text-slate-500">
                Estimated price only — final pricing confirmed by Balaji Holidays.
              </p>
            </div>

            {pkg.description && (
              <p className="mt-5 leading-relaxed text-slate-600">{pkg.description}</p>
            )}

            {places.length > 0 && (
              <div className="mt-5">
                <h2 className="font-semibold text-navy-900">Places covered</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {places.map((pl) => (
                    <span key={pl} className="rounded-full border border-navy-100 bg-navy-50 px-3 py-1 text-sm font-medium text-navy-800">
                      {pl}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {itinerary.length > 0 && (
              <div className="mt-5">
                <h2 className="font-semibold text-navy-900">Itinerary</h2>
                <ol className="mt-2 space-y-2">
                  {itinerary.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {it}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#enquire" className="btn-gold">Book Package</a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div id="enquire" className="mx-auto mt-12 max-w-2xl scroll-mt-24">
          <PackageEnquiryForm packageId={pkg.id} packageName={pkg.name} />
        </div>
      </div>
    </div>
  );
}
