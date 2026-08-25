import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, MessageCircle, Clock } from "@/components/ui/icons";
import { whatsappLink, telLink, instagramLink } from "@/lib/links";
import { BrandLogo } from "@/components/shared/brand-logo";
import type { SiteSettings } from "@/lib/settings";

export function Footer({ settings }: { settings: SiteSettings }) {
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const ig = instagramLink(settings.instagram);

  return (
    <footer className="relative bg-navy-gradient text-slate-300">
      <div aria-hidden className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
      <div className="container-px grid grid-cols-1 gap-12 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandLogo className="h-10 w-10 rounded-xl ring-1 ring-gold-400/30" />
            <p className="font-display text-lg font-bold text-white">{settings.businessName}</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            {settings.tagline} {settings.footerText}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gold-300">
            <Clock className="h-4 w-4" /> Available 24 Hours
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              ["Vehicles", "/vehicles"],
              ["Price Calculator", "/calculator"],
              ["Packages", "/packages"],
              ["Gallery", "/gallery"],
              ["About Us", "/about"],
              ["Contact", "/contact"],
              ["Book Now", "/book"],
              ["Customer Login", "/login"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-slate-400 transition-colors hover:text-gold-300"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Services
          </h4>
          <ul className="space-y-2.5 text-sm">
            {settings.services.slice(0, 12).map((s) => (
              <li key={s} className="flex items-center gap-2 text-slate-400">
                <span aria-hidden className="h-1 w-1 rounded-full bg-gold-400/70" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Contact
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <span className="text-slate-400">Office: <span className="text-slate-300 inline-block">{settings.address}</span></span>
            </li>
            {settings.phones.map((p) => (
              <li key={p}>
                <a href={telLink(p)} className="flex items-center gap-2.5 transition-colors hover:text-gold-300">
                  <Phone className="h-4 w-4 shrink-0 text-gold-400" />
                  <span className="font-medium text-white">{p}</span>
                </a>
              </li>
            ))}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 transition-colors hover:text-gold-300">
                  <Mail className="h-4 w-4 shrink-0 text-gold-400" /> {settings.email}
                </a>
              </li>
            )}
            <li>
              <a href={ig} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 transition-colors hover:text-gold-300">
                <Instagram className="h-4 w-4 shrink-0 text-gold-400" /> {settings.instagram}
              </a>
            </li>
            <li>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 transition-colors hover:text-gold-300">
                <MessageCircle className="h-4 w-4 shrink-0 text-gold-400" /> WhatsApp Us
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-px flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.businessName}, {settings.city}. All rights reserved.
          </p>
          <p>Estimated prices only — final fare confirmed by {settings.businessName}.</p>
        </div>
      </div>
    </footer>
  );
}