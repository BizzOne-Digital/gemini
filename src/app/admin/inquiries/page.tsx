"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/useDeferredEffect";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { format } from "date-fns";

interface Inquiry {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  reason: string;
  message: string;
  status: string;
  createdAt: string;
}

const statuses = ["new", "read", "replied", "archived"];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("new");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/inquiries?${params}`);
    const data = await res.json();
    setInquiries(data.inquiries || []);
    setPagination(data.pagination || { pages: 1, total: 0 });
    setLoading(false);
  }, [page, statusFilter]);

  useDeferredEffect(() => { void fetchInquiries(); }, [fetchInquiries]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success("Inquiry updated"); fetchInquiries(); }
    else toast.error("Update failed");
  };

  const columns: Column<Inquiry>[] = [
    { key: "fullName", header: "Name", render: (row) => <span className="font-medium">{row.fullName}</span> },
    { key: "email", header: "Email" },
    { key: "reason", header: "Reason", render: (row) => <span className="capitalize">{row.reason.replace("_", " ")}</span> },
    { key: "status", header: "Status", render: (row) => (
      <select value={row.status} onChange={(e) => updateStatus(row._id, e.target.value)} className="rounded border border-border px-2 py-1 text-xs capitalize">
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    )},
    { key: "date", header: "Date", render: (row) => format(new Date(row.createdAt), "MMM d, yyyy") },
    { key: "actions", header: "", render: (row) => (
      <button type="button" onClick={() => { setSelected(row); if (row.status === "new") updateStatus(row._id, "read"); }} className="text-sm text-primary hover:underline">View</button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {["", ...statuses].map((s) => (
          <button key={s || "all"} type="button" onClick={() => { setStatusFilter(s); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm capitalize ${statusFilter === s ? "bg-primary text-white" : "border"}`}>{s || "All"}</button>
        ))}
      </div>
      <DataTable columns={columns} data={inquiries} loading={loading} pagination={{ page, pages: pagination.pages, total: pagination.total, onPageChange: setPage }} />

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-elevated">
            <h3 className="text-lg font-semibold">Inquiry from {selected.fullName}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{selected.email} {selected.phone && `· ${selected.phone}`}</p>
            <p className="mt-4 rounded-lg bg-muted p-4 text-sm">{selected.message}</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => { updateStatus(selected._id, "replied"); setSelected(null); }} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">Mark Replied</button>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
