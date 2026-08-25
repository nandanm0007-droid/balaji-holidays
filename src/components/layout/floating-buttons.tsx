"use client";

import { MessageCircle, Phone } from "@/components/ui/icons";
import { whatsappLink, telLink } from "@/lib/links";
import type { SiteSettings } from "@/lib/settings";

export function FloatingButtons({ settings }: { settings: SiteSettings }) {
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const phone = settings.phones[0] || "";

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-600/30 transition-transform hover:scale-110"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring" aria-hidden />
        <MessageCircle className="relative h-7 w-7" />
      </a>
      <a
        href={telLink(phone)}
        aria-label="Call now"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg shadow-navy-900/30 transition-transform hover:scale-110 md:hidden"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}
