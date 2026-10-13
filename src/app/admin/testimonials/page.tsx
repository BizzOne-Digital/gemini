"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/useDeferredEffect";
import { Check, X, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { format } from "date-fns";

interface Testimonial {
  _id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  status: string;
  isFeatured: boolean;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/testimonials?${params}`);
    const data = await res.json();
    setTestimonials(data.testimonials || []);
    setPagination(data.pagination || { pages: 1, total: 0 });
    setLoading(false);
  }, [page, statusFilter]);

  useDeferredEffect(() => { void fetchTestimonials(); }, [fetchTestimonials]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success(`Testimonial ${status}`); fetchTestimonials(); }
    else toast.error("Update failed");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/testimonials/${deleteId}`, { method: "DELETE" });
    if (res.ok) { toast.success("Testimonial archived"); setDeleteId(null); fetchTestimonials(); }
    else toast.error("Delete failed");
  };

  const columns: Column<Testimonial>[] = [
    { key: "customerName", header: "Customer", render: (row) => <span className="font-medium">{row.customerName}</span> },
    { key: "rating", header: "Rating", render: (row) => (
      <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < row.rating ? "fill-butter-gold text-butter-gold" : "text-gray-300"}`} />)}</div>
    )},
    { key: "reviewText", header: "Review", render: (row) => <span className="line-clamp-2 max-w-xs text-sm">{row.reviewText}</span> },
    { key: "status", header: "Status", render: (row) => (
      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${row.status === "approved" ? "bg-green-100 text-green-700" : row.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{row.status}</span>
    )},
    { key: "date", header: "Date", render: (row) => format(new Date(row.createdAt), "MMM d, yyyy") },
    { key: "actions", header: "", render: (row) => (
      <div className="flex gap-1">
        {row.status === "pending" && (
          <>
            <button type="button" onClick={() => updateStatus(row._id, "approved")} className="rounded p-1 text-green-600 hover:bg-green-50"><Check className="h-4 w-4" /></button>
            <button type="button" onClick={() => updateStatus(row._id, "rejected")} className="rounded p-1 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></button>
          </>
        )}
        <button type="button" onClick={() => setDeleteId(row._id)} className="rounded p-1 text-destructive hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {["pending", "approved", "rejected", ""].map((s) => (
          <button key={s || "all"} type="button" onClick={() => { setStatusFilter(s); setPage(1); }} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${statusFilter === s ? "bg-primary text-white" : "border border-border hover:bg-muted"}`}>
            {s || "All"}
          </button>
        ))}
      </div>
      <DataTable columns={columns} data={testimonials} loading={loading} pagination={{ page, pages: pagination.pages, total: pagination.total, onPageChange: setPage }} />
      <ConfirmDialog open={!!deleteId} title="Archive Testimonial" description="This testimonial will be archived." confirmLabel="Archive" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
