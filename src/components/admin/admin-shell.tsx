"use client";

import * as React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Menu } from "@/components/ui/icons";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-slate-100">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-navy-950 lg:block">
        <AdminSidebar />
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-navy-950">
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <button onClick={() => setOpen(true)} className="text-navy-900">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-display font-bold text-navy-900">Admin Panel</span>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
