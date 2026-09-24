"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/useDeferredEffect";
import { Plus, Search, Trash2, Star, Eye, EyeOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LocalImageField } from "@/components/admin/LocalImageField";
import { formatPrice } from "@/lib/utils";

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  category?: { name: string };
}

interface Category {
  _id: string;
  name: string;
}

type ItemFormState = {
  name: string;
  price: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
};

const emptyForm: ItemFormState = {
  name: "",
  price: "",
  category: "",
  description: "",
  image: "",
  imageAlt: "",
  isAvailable: true,
  isFeatured: false,
  isPopular: false,
};

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ItemFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);

    const res = await fetch(`/api/admin/menu/items?${params}`);
    const data = await res.json();
    setItems(data.items || []);
    setPagination(data.pagination || { pages: 1, total: 0 });
    setLoading(false);
  }, [page, search, categoryFilter]);

  useDeferredEffect(() => {
    void fetchItems();
    fetch("/api/admin/menu/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, [fetchItems]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/menu/items/${id}`);
      if (!res.ok) throw new Error("Failed to load item");
      const item = await res.json();
      setEditingId(id);
      setForm({
        name: item.name || "",
        price: String(item.price ?? ""),
        category:
          typeof item.category === "object" && item.category?._id
            ? item.category._id
            : item.category || "",
        description: item.description || "",
        image: item.image || "",
        imageAlt: item.imageAlt || "",
        isAvailable: item.isAvailable !== false,
        isFeatured: !!item.isFeatured,
        isPopular: !!item.isPopular,
      });
      setShowForm(true);
    } catch {
      toast.error("Could not load menu item");
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error("Name, price, and category are required");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      category: form.category,
      description: form.description || undefined,
      image: form.image || undefined,
      imageAlt: form.imageAlt || undefined,
      isAvailable: form.isAvailable,
      isFeatured: form.isFeatured,
      isPopular: form.isPopular,
    };

    const url = editingId
      ? `/api/admin/menu/items/${editingId}`
      : "/api/admin/menu/items";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
      toast.success(editingId ? "Menu item updated" : "Menu item created");
      closeForm();
      fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async (updates: Record<string, unknown>) => {
    if (!selectedIds.length) return;
    const res = await fetch("/api/admin/menu/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, updates }),
    });
    if (res.ok) {
      toast.success("Items updated");
      setSelectedIds([]);
      fetchItems();
    } else toast.error("Bulk update failed");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/menu/items/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Item archived");
      setDeleteId(null);
      fetchItems();
    } else toast.error("Delete failed");
  };

  const columns: Column<MenuItem>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (row) => row.category?.name || "—",
    },
    {
      key: "price",
      header: "Price",
      render: (row) => formatPrice(row.price, row.currency),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex gap-1">
          {row.isAvailable ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
              Available
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
              Unavailable
            </span>
          )}
          {row.isFeatured && <Star className="h-4 w-4 text-butter-gold" />}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(row._id)}
            className="text-primary hover:text-primary/80"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteId(row._id)}
            className="text-destructive hover:text-destructive/80"
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-border py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-heritage-green"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex gap-2 rounded-lg border border-border bg-white p-3">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} selected
          </span>
          <button
            type="button"
            onClick={() => handleBulkUpdate({ isAvailable: true })}
            className="flex items-center gap-1 rounded bg-green-100 px-3 py-1 text-xs text-green-700"
          >
            <Eye className="h-3 w-3" /> Available
          </button>
          <button
            type="button"
            onClick={() => handleBulkUpdate({ isAvailable: false })}
            className="flex items-center gap-1 rounded bg-red-100 px-3 py-1 text-xs text-red-700"
          >
            <EyeOff className="h-3 w-3" /> Unavailable
          </button>
          <button
            type="button"
            onClick={() => handleBulkUpdate({ isFeatured: true })}
            className="flex items-center gap-1 rounded bg-yellow-100 px-3 py-1 text-xs text-yellow-700"
          >
            <Star className="h-3 w-3" /> Feature
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelect={(id) =>
          setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          )
        }
        onSelectAll={(sel) =>
          setSelectedIds(sel ? items.map((i) => i._id) : [])
        }
        pagination={{
          page,
          pages: pagination.pages,
          total: pagination.total,
          onPageChange: setPage,
        }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeForm} />
          <div className="relative my-8 w-full max-w-lg rounded-xl bg-white p-6 shadow-elevated">
            <h3 className="text-lg font-semibold">
              {editingId ? "Edit Menu Item" : "Add Menu Item"}
            </h3>
            <div className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                placeholder="Price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                rows={3}
              />
              <LocalImageField
                label="Product photo"
                folder="products"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />
              <input
                placeholder="Image alt text (optional)"
                value={form.imageAlt}
                onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) =>
                      setForm({ ...form, isAvailable: e.target.checked })
                    }
                  />
                  Available
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) =>
                      setForm({ ...form, isPopular: e.target.checked })
                    }
                  />
                  Popular
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
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
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Archive Menu Item"
        description="This item will be archived and hidden from the public menu."
        confirmLabel="Archive"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
