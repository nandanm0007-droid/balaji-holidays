"use client";

import * as React from "react";
import { setEnquiryStatus, setEnquiryNotes, setPackageEnquiryStatus } from "@/actions/admin-actions";
import { relativeTime, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ENQUIRY_STATUS_LABELS } from "@/lib/constants";
import { Phone, Mail, MessageCircle } from "@/components/ui/icons";

type EnquiryRow = {
  id: string;
  kind: "general" | "package";
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  travelDate: string | null;
  passengers: number | null;
  packageName: string | null;
};

const tone = (s: string) => {
  switch (s) {
    case "CONVERTED":
    case "CONTACTED":
      return "green" as const;
    case "CLOSED":
      return "red" as const;
    case "FOLLOWUP":
      return "amber" as const;
    default:
      return "blue" as const;
  }
};

export function EnquiryManager({ enquiries }: { enquiries: EnquiryRow[] }) {
  const [tab, setTab] = React.useState<"general" | "package">("general");
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const list = enquiries.filter((e) => (tab === "general" ? e.kind === "general" : e.kind === "package"));

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Enquiry Management</h1>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setTab("general")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === "general" ? "bg-navy-800 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
        >
          General Enquiries
        </button>
        <button
          onClick={() => setTab("package")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === "package" ? "bg-navy-800 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
        >
          Package Enquiries
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 && <div className="card p-8 text-center text-slate-500">No enquiries.</div>}
        {list.map((e) => (
          <div key={`${e.kind}-${e.id}`} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-navy-900">{e.name}</p>
                  <Badge tone={tone(e.status)}>{ENQUIRY_STATUS_LABELS[e.status as keyof typeof ENQUIRY_STATUS_LABELS]}</Badge>
                </div>
                <p className="text-sm text-slate-600">
                  {e.packageName ? `Package: ${e.packageName}` : e.subject}
                  {e.travelDate && ` · ${formatDate(e.travelDate)}`}
                  {e.passengers != null && ` · ${e.passengers} pax`}
                </p>
                <p className="mt-1 text-sm text-slate-500">{e.message}</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-sm">
                <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-navy-700 hover:underline">
                  <Phone className="h-4 w-4" /> {e.phone}
                </a>
                {e.email && (
                  <a href={`mailto:${e.email}`} className="flex items-center gap-1 text-navy-700 hover:underline">
                    <Mail className="h-4 w-4" /> {e.email}
                  </a>
                )}
                <span className="text-xs text-slate-400">{relativeTime(e.createdAt)}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                <select
                  value={e.status}
                  onChange={async (ev) => {
                    if (e.kind === "package") await setPackageEnquiryStatus(e.id, ev.target.value);
                    else await setEnquiryStatus(e.id, ev.target.value);
                  }}
                  className="input w-40"
                >
                  {Object.entries(ENQUIRY_STATUS_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-slate-600">Notes</label>
                <div className="flex gap-2">
                  <Textarea
                    value={notes[e.id] ?? e.adminNotes ?? ""}
                    onChange={(ev) => setNotes((n) => ({ ...n, [e.id]: ev.target.value }))}
                    className="min-h-[40px]"
                  />
                  <Button
                    size="sm"
                    onClick={async () => {
                      await setEnquiryNotes(e.id, notes[e.id] ?? e.adminNotes ?? "");
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
              <a
                href={`https://wa.me/91${e.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${e.name}, this is Balaji Holidays regarding your enquiry.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp !px-3 !py-2 text-sm"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
