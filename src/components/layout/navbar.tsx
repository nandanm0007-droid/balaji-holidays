"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { whatsappLink, telLink } from "@/lib/links";
import { Menu, X, Phone, MessageCircle, User } from "@/components/ui/icons";
import { BrandLogo } from "@/components/shared/brand-logo";
import type { SiteSettings } from "@/lib/settings";
import type { SessionUser } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/calculator", label: "Price Calculator" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/enquiry", label: "Enquiry" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({
  settings,
  session,
}: {
  settings: SiteSettings;
  session: SessionUser | null;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  const phone = settings.phones[0] || "";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-soft backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div aria-hidden className="h-px w-full bg-gold-gradient" />

      {/* top bar */}
      <div className="hidden bg-navy-950 text-white md:block">
        <div className="container-px flex items-center justify-between py-1 text-[11px] tracking-wide">
          <p className="flex items-center gap-2 font-medium">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-slate-300">24 HOURS SERVICE</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">ALL TYPES OF VEHICLES</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">TRAIN & FLIGHT BOOKING</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">PACKAGE TRIPS AVAILABLE</span>
          </p>
          <div className="flex items-center gap-4">
            {settings.phones.map((p) => (
              <a
                key={p}
                href={telLink(p)}
                className="flex items-center gap-1 font-semibold text-gold-300 transition-colors hover:text-gold-200"
              >
                <Phone className="h-3 w-3" /> {p}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container-px flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-95"
          onClick={() => setOpen(false)}
        >
          <BrandLogo className="h-11 w-11 transition-transform duration-300 group-hover:scale-105" />
          <div className="leading-tight">
            <p className="font-display text-[15px] font-bold tracking-tight text-navy-900">
              {settings.businessName}
            </p>
            <p className="text-[11px] font-medium text-slate-500">
              {settings.city}, {settings.state}
            </p>
          </div>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors hover:bg-navy-50 hover:text-navy-900",
                  active ? "text-navy-900" : "text-slate-600",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-gold-gradient transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            );
          })}
          <Link
            href="/book"
            className="btn-gold btn-shine ml-2 !px-4 !py-2 text-sm"
          >
            Book Now
          </Link>
        </nav>

        {/* right actions */}
        <div className="hidden items-center gap-1.5 lg:flex">
          <a href={telLink(phone)} className="btn-outline !px-3 !py-2 text-sm">
            <Phone className="h-4 w-4" /> Call Now
          </a>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp !px-3 !py-2 text-sm"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          {session ? (
            <Link
              href={session.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-navy-800 hover:bg-navy-50"
            >
              <User className="h-4 w-4" /> My Account
            </Link>
          ) : (
            <Link href="/login" className="btn-ghost !px-3 !py-2 text-sm">
              Login
            </Link>
          )}
        </div>

        {/* mobile toggle */}
        <button
          className="rounded-lg p-2 text-navy-900 transition-colors hover:bg-navy-50 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="animate-slide-down border-t border-slate-200 bg-white lg:hidden">
          <nav className="container-px flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-navy-50",
                  pathname === item.href && "bg-navy-50 font-semibold text-navy-900",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link href="/book" onClick={() => setOpen(false)} className="btn-gold w-full">
                Book Now
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <a href={telLink(phone)} className="btn-outline w-full">
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
              <Link
                href={session ? (session.role === "ADMIN" ? "/admin" : "/dashboard") : "/login"}
                onClick={() => setOpen(false)}
                className="btn-outline w-full"
              >
                <User className="h-4 w-4" /> {session ? "My Account" : "Login"}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}