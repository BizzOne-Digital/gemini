"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LocalImageField } from "@/components/admin/LocalImageField";

interface Service {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", shortDescription: "", fullDescription: "", image: "", ctaLabel: "Learn More", ctaHref: "/contact", displayOrder: 0,
  });

  const fetchServices = () => {
    setLoading(true);
    fetch("/api/admin/services").then((r) => r.json()).then(setServices).finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSave = async () => {
    const url = editing ? `/api/admin/services/${editing._id}` : "/api/admin/services";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success(editing ? "Service updated" : "Service created");
      setShowForm(false);
      setEditing(null);
      fetchServices();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/services/${deleteId}`, { method: "DELETE" });
    if (res.ok) { toast.success("Service archived"); setDeleteId(null); fetchServices(); }
    else toast.error("Delete failed");
  };

  const columns: Column<Service>[] = [
    { key: "title", header: "Title", render: (row) => <span className="font-medium">{row.title}</span> },
    { key: "shortDescription", header: "Description", render: (row) => <span className="line-clamp-1 max-w-xs">{row.shortDescription}</span> },
    { key: "displayOrder", header: "Order" },
    { key: "status", header: "Status", render: (row) => <span className={`rounded-full px-2 py-0.5 text-xs ${row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>{row.isActive ? "Active" : "Inactive"}</span> },
    { key: "actions", header: "", render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => { setEditing(row); setForm({ title: row.title, shortDescription: row.shortDescription, fullDescription: "", image: "", ctaLabel: "Learn More", ctaHref: "/contact", displayOrder: row.displayOrder }); setShowForm(true); }} className="text-primary"><Pencil className="h-4 w-4" /></button>
        <button type="button" onClick={() => setDeleteId(row._id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={() => { setEditing(null); setForm({ title: "", shortDescription: "", fullDescription: "", image: "", ctaLabel: "Learn More", ctaHref: "/contact", displayOrder: 0 }); setShowForm(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>
      <DataTable columns={columns} data={services} loading={loading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-elevated">
            <h3 className="text-lg font-semibold">{editing ? "Edit" : "Add"} Service</h3>
            <div className="mt-4 space-y-4">
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
              <textarea placeholder="Short Description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" rows={2} />
              <textarea placeholder="Full Description" value={form.fullDescription} onChange={(e) => setForm({ ...form, fullDescription: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" rows={4} />
              <LocalImageField folder="products" label="Service Image" value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button type="button" onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteId} title="Archive Service" description="This service will be archived." confirmLabel="Archive" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
