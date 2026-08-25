import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery — Balaji Holidays Shivamogga",
  description:
    "Photos of our buses, Tempo Travellers, Innova cars, trips and destinations from Balaji Holidays, Shivamogga.",
};

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        eyebrow="Gallery"
        title="Moments From Our Journeys"
        subtitle="A glimpse of our fleet, trips and destinations across Karnataka and beyond."
        compact
      />

      <div className="container-px py-10 sm:py-14">
        {Object.entries(grouped).map(([category, list], sectionIdx) => (
          <section key={category} className={sectionIdx > 0 ? "mt-12" : ""}>
            <div className="mb-5 flex items-center gap-3">
              <h2 className="font-display text-xl font-bold text-navy-900 sm:text-2xl">{category}</h2>
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-r from-navy-200 to-transparent"
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {list.length}
              </span>
            </div>
            <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5 [&>*]:mb-3 sm:[&>*]:mb-4 lg:[&>*]:mb-5">
              {list.map((item, i) => (
                <figure
                  key={item.id}
                  className={
                    "group relative overflow-hidden rounded-xl bg-slate-200 shadow-soft transition-shadow duration-300 hover:shadow-soft-lg " +
                    (i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-[4/3]" : "aspect-square")
                  }
                >
                  <img
                    src={item.url}
                    alt={item.title || category}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {item.title && (
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-3 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {item.title}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        ))}

        {items.length === 0 && (
          <div className="card p-10 text-center text-slate-500">Gallery coming soon.</div>
        )}
      </div>
    </div>
  );
}