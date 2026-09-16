"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/useDeferredEffect";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { format } from "date-fns";

interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  performedByEmail: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (entityFilter) params.set("entity", entityFilter);
    const res = await fetch(`/api/admin/audit-logs?${params}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setPagination(data.pagination || { pages: 1, total: 0 });
    setLoading(false);
  }, [page, entityFilter]);

  useDeferredEffect(() => { void fetchLogs(); }, [fetchLogs]);

  const columns: Column<AuditLog>[] = [
    { key: "action", header: "Action", render: (row) => <span className="font-medium capitalize">{row.action}</span> },
    { key: "entity", header: "Entity", render: (row) => <span className="capitalize">{row.entity.replace("_", " ")}</span> },
    { key: "entityId", header: "Entity ID", render: (row) => <span className="font-mono text-xs">{row.entityId?.slice(-8) || "—"}</span> },
    { key: "performedByEmail", header: "User" },
    { key: "createdAt", header: "Date", render: (row) => format(new Date(row.createdAt), "MMM d, yyyy h:mm a") },
  ];

  const entities = ["menu_item", "menu_category", "service", "testimonial", "booking", "inquiry", "media", "site_settings", "navigation", "page_content", "seo_settings", "admin_user"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => { setEntityFilter(""); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm ${!entityFilter ? "bg-primary text-white" : "border"}`}>All</button>
        {entities.map((e) => (
          <button key={e} type="button" onClick={() => { setEntityFilter(e); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm capitalize ${entityFilter === e ? "bg-primary text-white" : "border"}`}>{e.replace("_", " ")}</button>
        ))}
      </div>
      <DataTable columns={columns} data={logs} loading={loading} pagination={{ page, pages: pagination.pages, total: pagination.total, onPageChange: setPage }} />
    </div>
  );
}
