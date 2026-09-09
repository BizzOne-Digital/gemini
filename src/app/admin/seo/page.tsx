"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LocalImageField } from "@/components/admin/LocalImageField";

interface PageSeo {
  path: string;
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex: boolean;
}

interface SeoSettings {
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage?: string;
  pages: PageSeo[];
}

export default function SeoPage() {
  const [seo, setSeo] = useState<SeoSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/seo").then((r) => r.json()).then(setSeo);
  }, []);

  const handleSave = async () => {
    if (!seo) return;
    setSaving(true);
    const res = await fetch("/api/admin/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seo),
    });
    if (res.ok) toast.success("SEO settings saved");
    else toast.error("Save failed");
    setSaving(false);
  };

  const updatePage = (index: number, updates: Partial<PageSeo>) => {
    if (!seo) return;
    const pages = [...seo.pages];
    pages[index] = { ...pages[index], ...updates };
    setSeo({ ...seo, pages });
  };

  const addPage = () => {
    if (!seo) return;
    setSeo({ ...seo, pages: [...seo.pages, { path: "/", title: "", description: "", noIndex: false }] });
  };

  const removePage = (index: number) => {
    if (!seo) return;
    setSeo({ ...seo, pages: seo.pages.filter((_, i) => i !== index) });
  };

  if (!seo) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Default SEO</h2>
        <div className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium">Default Title</label><input value={seo.defaultTitle} onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm font-medium">Default Description</label><textarea value={seo.defaultDescription} onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div><LocalImageField folder="pages" label="Default OG Image" value={seo.defaultOgImage} onChange={(url) => setSeo({ ...seo, defaultOgImage: url })} /></div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Page SEO</h2>
          <button type="button" onClick={addPage} className="flex items-center gap-1 text-sm text-primary"><Plus className="h-4 w-4" /> Add Page</button>
        </div>
        <div className="space-y-6">
          {seo.pages.map((page, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <input placeholder="Path (e.g. /menu)" value={page.path} onChange={(e) => updatePage(i, { path: e.target.value })} className="font-medium border-b border-transparent focus:border-primary focus:outline-none" />
                <button type="button" onClick={() => removePage(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <input placeholder="Title" value={page.title} onChange={(e) => updatePage(i, { title: e.target.value })} className="w-full rounded border border-border px-3 py-2 text-sm" />
              <textarea placeholder="Description" value={page.description} onChange={(e) => updatePage(i, { description: e.target.value })} rows={2} className="w-full rounded border border-border px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={page.noIndex} onChange={(e) => updatePage(i, { noIndex: e.target.checked })} /> No Index</label>
            </div>
          ))}
        </div>
      </section>

      <button type="button" onClick={handleSave} disabled={saving} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50">
        {saving ? "Saving..." : "Save SEO Settings"}
      </button>
    </div>
  );
}
