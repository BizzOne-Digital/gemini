"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface NavLink {
  label: string;
  href: string;
  openInNewTab: boolean;
  isVisible: boolean;
  displayOrder: number;
}

interface Navigation {
  links: NavLink[];
  ctaCall: { label: string; href: string; isVisible: boolean };
  ctaOrder: { label: string; href: string; isVisible: boolean; openInNewTab: boolean };
}

export default function NavigationPage() {
  const [nav, setNav] = useState<Navigation | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/navigation").then((r) => r.json()).then(setNav);
  }, []);

  const handleSave = async () => {
    if (!nav) return;
    setSaving(true);
    const res = await fetch("/api/admin/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nav),
    });
    if (res.ok) toast.success("Navigation saved");
    else toast.error("Save failed");
    setSaving(false);
  };

  const updateLink = (index: number, updates: Partial<NavLink>) => {
    if (!nav) return;
    const links = [...nav.links];
    links[index] = { ...links[index], ...updates };
    setNav({ ...nav, links });
  };

  const addLink = () => {
    if (!nav) return;
    setNav({ ...nav, links: [...nav.links, { label: "", href: "", openInNewTab: false, isVisible: true, displayOrder: nav.links.length }] });
  };

  const removeLink = (index: number) => {
    if (!nav) return;
    setNav({ ...nav, links: nav.links.filter((_, i) => i !== index) });
  };

  if (!nav) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Navigation Links</h2>
          <button type="button" onClick={addLink} className="flex items-center gap-1 text-sm text-primary"><Plus className="h-4 w-4" /> Add Link</button>
        </div>
        <div className="space-y-3">
          {nav.links.map((link, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Label" value={link.label} onChange={(e) => updateLink(i, { label: e.target.value })} className="flex-1 rounded border border-border px-3 py-1.5 text-sm" />
              <input placeholder="Href" value={link.href} onChange={(e) => updateLink(i, { href: e.target.value })} className="flex-1 rounded border border-border px-3 py-1.5 text-sm" />
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={link.isVisible} onChange={(e) => updateLink(i, { isVisible: e.target.checked })} /> Visible</label>
              <button type="button" onClick={() => removeLink(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h3 className="mb-4 font-semibold">Call CTA</h3>
          <div className="space-y-3">
            <input placeholder="Label" value={nav.ctaCall.label} onChange={(e) => setNav({ ...nav, ctaCall: { ...nav.ctaCall, label: e.target.value } })} className="w-full rounded border border-border px-3 py-2 text-sm" />
            <input placeholder="Href" value={nav.ctaCall.href} onChange={(e) => setNav({ ...nav, ctaCall: { ...nav.ctaCall, href: e.target.value } })} className="w-full rounded border border-border px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nav.ctaCall.isVisible} onChange={(e) => setNav({ ...nav, ctaCall: { ...nav.ctaCall, isVisible: e.target.checked } })} /> Visible</label>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h3 className="mb-4 font-semibold">Order CTA</h3>
          <div className="space-y-3">
            <input placeholder="Label" value={nav.ctaOrder.label} onChange={(e) => setNav({ ...nav, ctaOrder: { ...nav.ctaOrder, label: e.target.value } })} className="w-full rounded border border-border px-3 py-2 text-sm" />
            <input placeholder="Href" value={nav.ctaOrder.href || ""} onChange={(e) => setNav({ ...nav, ctaOrder: { ...nav.ctaOrder, href: e.target.value } })} className="w-full rounded border border-border px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nav.ctaOrder.isVisible} onChange={(e) => setNav({ ...nav, ctaOrder: { ...nav.ctaOrder, isVisible: e.target.checked } })} /> Visible</label>
          </div>
        </div>
      </div>

      <button type="button" onClick={handleSave} disabled={saving} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50">
        {saving ? "Saving..." : "Save Navigation"}
      </button>
    </div>
  );
}
