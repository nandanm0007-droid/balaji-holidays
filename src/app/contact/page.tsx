import { getSettings } from "@/lib/settings";
import { whatsappLink, telLink, instagramLink } from "@/lib/links";
import { PageHeader } from "@/components/shared/page-header";
import { Phone, MessageCircle, Instagram, MapPin, Mail, Clock } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact — Balaji Holidays Shivamogga",
  description:
    "Contact Balaji Holidays, Shivamogga for bus rental, Tempo Traveller, Innova and package trips. Call 8880555522, 6360872228 or 8660061227.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const ig = instagramLink(settings.instagram);

  const tiles = [
    {
      icon: Phone,
      title: "Call us",
      content: settings.phones.map((p) => (
        <a key={p} href={telLink(p)} className="block font-medium text-navy-800 transition-colors hover:text-gold-600">
          {p}
        </a>
      )),
    },
    ...(settings.email
      ? [
          {
            icon: Mail,
            title: "Email",
            content: (
              <a href={`mailto:${settings.email}`} className="font-medium text-navy-800 transition-colors hover:text-gold-600">
                {settings.email}
              </a>
            ),
          },
        ]
      : []),
    {
      icon: Instagram,
      title: "Instagram",
      content: (
        <a href={ig} target="_blank" rel="noopener noreferrer" className="font-medium text-navy-800 transition-colors hover:text-gold-600">
          {settings.instagram}
        </a>
      ),
    },
    {
      icon: Clock,
      title: "Hours",
      content: <p className="font-medium text-navy-800">Open 24 hours</p>,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Contact Us"
        title="We're Here, 24 Hours"
        subtitle="Call, WhatsApp or send an enquiry — reach Balaji Holidays any time of day or night."
      />

      <div className="container-px py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="section-title">{settings.businessName}</h2>
            <p className="mt-1.5 flex items-start gap-1.5 text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" /> {settings.address}
            </p>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {tiles.map((t) => (
                <div key={t.title} className="card-hover flex items-start gap-3.5 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-gradient text-gold-300 shadow-soft ring-1 ring-inset ring-gold-400/20">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{t.title}</p>
                    <div className="mt-0.5">{t.content}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={telLink(settings.phones[0])} className="btn-primary">
                <Phone className="h-4 w-4" /> Call Now
              </a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href={ig} target="_blank" rel="noopener noreferrer" className="btn-outline">
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <a href="/enquiry" className="btn-gold">
                Make an Enquiry
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-soft-lg">
            {settings.mapEmbedUrl ? (
              <iframe
                src={settings.mapEmbedUrl}
                className="h-full min-h-[360px] w-full"
                loading="lazy"
                title="Balaji Holidays location"
              />
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center bg-slate-100 text-slate-400">
                <MapPin className="mr-2 h-5 w-5" /> {settings.address}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}