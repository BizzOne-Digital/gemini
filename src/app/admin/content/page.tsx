"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { LocalImageField } from "@/components/admin/LocalImageField";

interface PageListItem {
  _id: string;
  pageSlug: string;
  pageTitle: string;
  updatedAt: string;
}

interface Section {
  key: string;
  heading?: string;
  subheading?: string;
  description?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  imageAlt?: string;
  isVisible: boolean;
  displayOrder: number;
}

interface PageContent {
  pageSlug: string;
  pageTitle: string;
  sections: Section[];
}

const defaultPages = ["home", "about", "menu", "services", "contact", "booking", "testimonials"];

export default function ContentPage() {
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content").then((r) => r.json()).then(setPages);
  }, []);

  const loadPage = async (slug: string) => {
    setLoading(true);
    setSelectedSlug(slug);
    const res = await fetch(`/api/admin/content/${slug}`);
    if (res.ok) {
      setContent(await res.json());
    } else {
      setContent({ pageSlug: slug, pageTitle: slug.charAt(0).toUpperCase() + slug.slice(1), sections: [] });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!content || !selectedSlug) return;
    setSaving(true);
    const res = await fetch(`/api/admin/content/${selectedSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    if (res.ok) {
      toast.success("Content saved");
      fetch("/api/admin/content").then((r) => r.json()).then(setPages);
    } else toast.error("Save failed");
    setSaving(false);
  };

  const addSection = () => {
    if (!content) return;
    setContent({
      ...content,
      sections: [...content.sections, { key: `section-${content.sections.length + 1}`, isVisible: true, displayOrder: content.sections.length }],
    });
  };

  const updateSection = (index: number, updates: Partial<Section>) => {
    if (!content) return;
    const sections = [...content.sections];
    sections[index] = { ...sections[index], ...updates };
    setContent({ ...content, sections });
  };

  const allSlugs = [...new Set([...defaultPages, ...pages.map((p) => p.pageSlug)])];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-white p-4 shadow-soft">
        <h2 className="mb-4 font-semibold">Pages</h2>
        <ul className="space-y-1">
          {allSlugs.map((slug) => (
            <li key={slug}>
              <button
                type="button"
                onClick={() => loadPage(slug)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm capitalize ${selectedSlug === slug ? "bg-primary text-white" : "hover:bg-muted"}`}
              >
                <Pencil className="h-3 w-3" />
                {slug}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-2">
        {!selectedSlug ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground">Select a page to edit</div>
        ) : loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading...</div>
        ) : content ? (
          <div className="space-y-6 rounded-xl border border-border bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <input
                value={content.pageTitle}
                onChange={(e) => setContent({ ...content, pageTitle: e.target.value })}
                className="text-lg font-semibold border-b border-transparent focus:border-primary focus:outline-none"
              />
              <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {content.sections.map((section, i) => (
              <div key={section.key} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <input value={section.key} onChange={(e) => updateSection(i, { key: e.target.value })} className="text-sm font-medium border-b border-transparent focus:border-primary focus:outline-none" />
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={section.isVisible} onChange={(e) => updateSection(i, { isVisible: e.target.checked })} />
                    Visible
                  </label>
                </div>
                <input placeholder="Eyebrow" value={section.eyebrow || ""} onChange={(e) => updateSection(i, { eyebrow: e.target.value })} className="w-full rounded border border-border px-3 py-2 text-sm" />
                <input placeholder="Heading" value={section.heading || ""} onChange={(e) => updateSection(i, { heading: e.target.value })} className="w-full rounded border border-border px-3 py-2 text-sm" />
                <input placeholder="Subheading" value={section.subheading || ""} onChange={(e) => updateSection(i, { subheading: e.target.value })} className="w-full rounded border border-border px-3 py-2 text-sm" />
                <textarea placeholder="Description" value={section.description || ""} onChange={(e) => updateSection(i, { description: e.target.value })} className="w-full rounded border border-border px-3 py-2 text-sm" rows={3} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input placeholder="CTA Label" value={section.ctaLabel || ""} onChange={(e) => updateSection(i, { ctaLabel: e.target.value })} className="rounded border border-border px-3 py-2 text-sm" />
                  <input placeholder="CTA Href" value={section.ctaHref || ""} onChange={(e) => updateSection(i, { ctaHref: e.target.value })} className="rounded border border-border px-3 py-2 text-sm" />
                </div>
                <LocalImageField folder="pages" label="Section Image" value={section.image} onChange={(url) => updateSection(i, { image: url })} />
              </div>
            ))}

            <button type="button" onClick={addSection} className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary w-full justify-center">
              <Plus className="h-4 w-4" /> Add Section
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
