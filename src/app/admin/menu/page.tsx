"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/useDeferredEffect";
import { Plus, Search, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
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
  const [form, setForm] = useState({ name: "", price: "", category: "", description: "" });

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
    fetch("/api/admin/menu/categories").then((r) => r.json()).then(setCategories);
  }, [fetchItems]);

  const handleCreate = async () => {
    const res = await fetch("/api/admin/menu/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    if (res.ok) {
      toast.success("Menu item created");
      setShowForm(false);
      setForm({ name: "", price: "", category: "", description: "" });
      fetchItems();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create");
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
    { key: "name", header: "Name", render: (row) => <span className="font-medium">{row.name}</span> },
    { key: "category", header: "Category", render: (row) => row.category?.name || "—" },
    { key: "price", header: "Price", render: (row) => formatPrice(row.price, row.currency) },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex gap-1">
          {row.isAvailable ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Available</span>
          ) : (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Unavailable</span>
          )}
          {row.isFeatured && <Star className="h-4 w-4 text-butter-gold" />}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button type="button" onClick={() => setDeleteId(row._id)} className="text-destructive hover:text-destructive/80">
          <Trash2 className="h-4 w-4" />
        </button>
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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="rounded-lg border border-border py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-heritage-green"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex gap-2 rounded-lg border border-border bg-white p-3">
          <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
          <button type="button" onClick={() => handleBulkUpdate({ isAvailable: true })} className="flex items-center gap-1 rounded bg-green-100 px-3 py-1 text-xs text-green-700">
            <Eye className="h-3 w-3" /> Available
          </button>
          <button type="button" onClick={() => handleBulkUpdate({ isAvailable: false })} className="flex items-center gap-1 rounded bg-red-100 px-3 py-1 text-xs text-red-700">
            <EyeOff className="h-3 w-3" /> Unavailable
          </button>
          <button type="button" onClick={() => handleBulkUpdate({ isFeatured: true })} className="flex items-center gap-1 rounded bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
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
        onSelect={(id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])}
        onSelectAll={(sel) => setSelectedIds(sel ? items.map((i) => i._id) : [])}
        pagination={{ page, pages: pagination.pages, total: pagination.total, onPageChange: setPage }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-elevated">
            <h3 className="text-lg font-semibold">Add Menu Item</h3>
            <div className="mt-4 space-y-4">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
              <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" rows={3} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button type="button" onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">Create</button>
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
