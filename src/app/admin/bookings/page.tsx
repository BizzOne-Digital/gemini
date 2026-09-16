"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/useDeferredEffect";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { format } from "date-fns";

interface Booking {
  _id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  requestType: string;
  preferredDate: string;
  preferredTime: string;
  numberOfGuests: number;
  status: string;
  createdAt: string;
}

const statuses = ["new", "contacted", "pending", "confirmed", "completed", "cancelled"];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [selected, setSelected] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/bookings?${params}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setPagination(data.pagination || { pages: 1, total: 0 });
    setLoading(false);
  }, [page, statusFilter]);

  useDeferredEffect(() => { void fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (id: string, status: string, note?: string) => {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    if (res.ok) { toast.success("Booking updated"); setSelected(null); fetchBookings(); }
    else toast.error("Update failed");
  };

  const columns: Column<Booking>[] = [
    { key: "referenceNumber", header: "Ref #", render: (row) => <span className="font-mono text-xs">{row.referenceNumber}</span> },
    { key: "fullName", header: "Guest", render: (row) => <span className="font-medium">{row.fullName}</span> },
    { key: "requestType", header: "Type", render: (row) => <span className="capitalize">{row.requestType.replace("_", " ")}</span> },
    { key: "date", header: "Date", render: (row) => format(new Date(row.preferredDate), "MMM d, yyyy") },
    { key: "time", header: "Time", render: (row) => row.preferredTime },
    { key: "guests", header: "Guests", render: (row) => row.numberOfGuests },
    { key: "status", header: "Status", render: (row) => (
      <select value={row.status} onChange={(e) => updateStatus(row._id, e.target.value)} className="rounded border border-border px-2 py-1 text-xs capitalize">
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    )},
    { key: "actions", header: "", render: (row) => (
      <button type="button" onClick={() => setSelected(row)} className="text-sm text-primary hover:underline">Details</button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => { setStatusFilter(""); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm ${!statusFilter ? "bg-primary text-white" : "border"}`}>All</button>
        {statuses.map((s) => (
          <button key={s} type="button" onClick={() => { setStatusFilter(s); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm capitalize ${statusFilter === s ? "bg-primary text-white" : "border"}`}>{s}</button>
        ))}
      </div>
      <DataTable columns={columns} data={bookings} loading={loading} pagination={{ page, pages: pagination.pages, total: pagination.total, onPageChange: setPage }} />

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-elevated">
            <h3 className="text-lg font-semibold">Booking Details</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Reference</dt><dd className="font-mono">{selected.referenceNumber}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{selected.fullName}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{selected.email}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Guests</dt><dd>{selected.numberOfGuests}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd>{format(new Date(selected.preferredDate), "PPP")} at {selected.preferredTime}</dd></div>
            </dl>
            <button type="button" onClick={() => setSelected(null)} className="mt-4 w-full rounded-lg border py-2 text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
