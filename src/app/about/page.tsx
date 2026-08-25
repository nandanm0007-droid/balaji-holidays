import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { parseJSON } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Star, Bus, Users, ShieldCheck, BadgeCheck, Train, Plane } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us — Balaji Holidays Shivamogga",
  description:
    "Learn about Balaji Holidays, a trusted travel agency and vehicle rental service in Shivamogga, Karnataka — buses, Tempo Travellers, Innova, train booking, flight booking and package trips.",
};

export default async function AboutPage() {
  const settings = await getSettings();
  const drivers = await prisma.driver.findMany({ where: { active: true } });

  return (
    <div>
      <PageHeader
        eyebrow="About Us"
        title="Your Trusted Travel Partner"
        subtitle="Balaji Holidays has been helping families, groups and corporates travel comfortably across Karnataka and beyond."
      />

      <div className="container-px py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Who We Are</h2>
            <p className="mt-4 leading-relaxed text-slate-600">{settings.aboutText}</p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { icon: Bus, label: "All Vehicle Types" },
                { icon: Users, label: "Group & Family Trips" },
                { icon: Train, label: "Train Booking" },
                { icon: Plane, label: "Flight Booking" },
                { icon: ShieldCheck, label: "24 Hours Service" },
              ].map((f) => (
                <div key={f.label} className="card-hover flex flex-col items-center p-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-600 ring-1 ring-inset ring-gold-200">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-navy-900">{f.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            {settings.ownerName ? (
              <div className="card p-6 sm:p-7">
                <div className="flex items-center gap-4">
                  {settings.ownerImage ? (
                    <img
                      src={settings.ownerImage}
                      alt={settings.ownerName}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-gradient font-display text-2xl font-bold text-gold-300">
                      {settings.ownerName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-display font-bold text-navy-900">{settings.ownerName}</p>
                    <p className="text-sm text-slate-500">Owner, {settings.businessName}</p>
                  </div>
                </div>
                {settings.ownerBio && <p className="mt-4 text-sm text-slate-600">{settings.ownerBio}</p>}
              </div>
            ) : (
              <div className="card p-6 sm:p-7">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-gold-600" />
                  <h3 className="font-display font-bold text-navy-900">Our Promise</h3>
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                  {[
                    "Clean, well-maintained and insured vehicles",
                    "Experienced, courteous and verified drivers",
                    "Transparent estimated pricing — no hidden surprises",
                    "Flexible booking for local and outstation trips",
                    "Train & flight booking assistance",
                    "Prompt support, 24 hours a day",
                  ].map((s) => (
                    <li key={s} className="flex items-start gap-2.5">
                      <Star className="mt-0.5 h-4 w-4 shrink-0 fill-gold-500 text-gold-500" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Drivers */}
        {drivers.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title">Our Drivers</h2>
            <p className="section-subtitle">Experienced professionals behind every safe journey.</p>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {drivers.map((d) => (
                <div key={d.id} className="card-hover flex items-start gap-4 p-5">
                  {d.photoUrl ? (
                    <img src={d.photoUrl} alt={d.name} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-gradient font-display text-xl font-bold text-gold-300">
                      {d.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-navy-900">{d.name}</p>
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-gold-600">
                        <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" /> {d.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {d.experienceYears} years experience · {parseJSON<string[]>(d.languages, []).join(", ")}
                    </p>
                    {d.bio && <p className="mt-2 text-sm text-slate-600">{d.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}