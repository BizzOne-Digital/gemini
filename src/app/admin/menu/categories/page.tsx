"use client";

import { useState } from "react";
import { useDeferredEffect } from "@/hooks/useDeferredEffect";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LocalImageField } from "@/components/admin/LocalImageField";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
}

type CategoryForm = {
  name: string;
  description: string;
  displayOrder: number;
  image: string;
  imageAlt: string;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  displayOrder: 0,
  image: "",
  imageAlt: "",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/admin/menu/categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useDeferredEffect(() => {
    fetchCategories();
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (row: Category) => {
    setEditing(row);
    setForm({
      name: row.name,
      description: row.description || "",
      displayOrder: row.displayOrder,
      image: row.image || "",
      imageAlt: row.imageAlt || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    const url = editing
      ? `/api/admin/menu/categories/${editing._id}`
      : "/api/admin/menu/categories";
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          displayOrder: form.displayOrder,
          image: form.image || undefined,
          imageAlt: form.imageAlt || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      toast.success(editing ? "Category updated" : "Category created");
      closeForm();
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/menu/categories/${deleteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Category archived");
      setDeleteId(null);
      fetchCategories();
    } else toast.error("Delete failed");
  };

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    { key: "slug", header: "Slug" },
    { key: "displayOrder", header: "Order" },
    {
      key: "image",
      header: "Photo",
      render: (row) =>
        row.image ? (
          <span className="text-xs text-green-700">Uploaded</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="text-primary"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteId(row._id)}
            className="text-destructive"
            aria-label={`Archive ${row.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <DataTable columns={columns} data={categories} loading={loading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeForm} />
          <div className="relative my-8 w-full max-w-md rounded-xl bg-white p-6 shadow-elevated">
            <h3 className="text-lg font-semibold">
              {editing ? "Edit" : "Add"} Category
            </h3>
            <div className="mt-4 space-y-4">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                rows={2}
              />
              <input
                type="number"
                placeholder="Display Order"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({
                    ...form,
                    displayOrder: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <LocalImageField
                label="Category photo"
                folder="gallery"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />
              <input
                placeholder="Image alt text (optional)"
                value={form.imageAlt}
                onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Archive Category"
        description="This category will be archived."
        confirmLabel="Archive"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
