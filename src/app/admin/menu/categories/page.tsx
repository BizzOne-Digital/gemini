"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Category {
  _id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", displayOrder: 0 });

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/admin/menu/categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async () => {
    const url = editing ? `/api/admin/menu/categories/${editing._id}` : "/api/admin/menu/categories";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success(editing ? "Category updated" : "Category created");
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", description: "", displayOrder: 0 });
      fetchCategories();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/menu/categories/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Category archived");
      setDeleteId(null);
      fetchCategories();
    } else toast.error("Delete failed");
  };

  const columns: Column<Category>[] = [
    { key: "name", header: "Name", render: (row) => <span className="font-medium">{row.name}</span> },
    { key: "slug", header: "Slug" },
    { key: "displayOrder", header: "Order" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`rounded-full px-2 py-0.5 text-xs ${row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => { setEditing(row); setForm({ name: row.name, description: "", displayOrder: row.displayOrder }); setShowForm(true); }} className="text-primary">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleteId(row._id)} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={() => { setEditing(null); setForm({ name: "", description: "", displayOrder: 0 }); setShowForm(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <DataTable columns={columns} data={categories} loading={loading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-elevated">
            <h3 className="text-lg font-semibold">{editing ? "Edit" : "Add"} Category</h3>
            <div className="mt-4 space-y-4">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" rows={2} />
              <input type="number" placeholder="Display Order" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button type="button" onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Archive Category" description="This category will be archived." confirmLabel="Archive" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
