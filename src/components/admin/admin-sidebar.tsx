"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth-actions";
import { BrandLogo } from "@/components/shared/brand-logo";
import {
  LayoutDashboard,
  Bus,
  IndianRupee,
  ClipboardList,
  MessageCircle,
  Users,
  Package,
  Images,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from "@/components/ui/icons";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/vehicles", label: "Vehicles", icon: Bus },
  { href: "/admin/pricing", label: "Pricing", icon: IndianRupee },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageCircle },
  { href: "/admin/drivers", label: "Drivers", icon: Users },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <BrandLogo className="h-9 w-9" />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold text-white">Balaji Holidays</p>
            <p className="text-[11px] text-slate-400">Admin Panel</p>
          </div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} className="text-slate-400 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gold-500 text-navy-950"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <l.icon className="h-5 w-5" /> {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-5 w-5" /> View Website
        </Link>
        <button
          onClick={async () => {
            await logoutAction();
            router.push("/");
            router.refresh();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>
    </div>
  );
}
