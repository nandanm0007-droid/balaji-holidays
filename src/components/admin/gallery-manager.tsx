"use client";

import * as React from "react";
import { saveGalleryItem, deleteGalleryItem } from "@/actions/admin-actions";
import { Input, Label, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import { Plus, Trash2, Loader2 } from "@/components/ui/icons";

type GalleryRow = { id: string; title: string | null; category: string; url: string; sortOrder: number };

export function GalleryManager({ items }: { items: GalleryRow[] }) {
  const [form, setForm] = React.useState({ title: "", category: "Trips", url: "", sortOrder: "0" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const save = async () => {
    if (!form.url.trim()) return setError("Image URL is required.");
    setBusy(true);
    const res = await saveGalleryItem(form);
    setBusy(false);
    if (!res.ok) return setError(res.error || "Error");
    setForm({ title: "", category: "Trips", url: "", sortOrder: "0" });
    setError("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Gallery Management</h1>
      <p className="text-sm text-slate-500">Upload image URLs, categorize and reorder.</p>

      <div className="card mt-6 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><Label>Image URL *</Label><Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="/images/… or https://…" /></div>
          <div><Label>Title / caption</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div><Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div><Label>Sort order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} /></div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <Button onClick={save} disabled={busy} className="mt-4">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Plus className="h-4 w-4" /> Add to Gallery</>}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.id} className="card group relative overflow-hidden">
            <img src={i.url} alt={i.title || i.category} className="h-32 w-full object-cover" />
            <div className="p-2">
              <p className="truncate text-sm font-semibold text-navy-900">{i.title || i.category}</p>
              <p className="text-xs text-slate-500">{i.category}</p>
            </div>
            <button
              onClick={async () => { if (confirm("Delete this image?")) await deleteGalleryItem(i.id); }}
              className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-red-500 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
