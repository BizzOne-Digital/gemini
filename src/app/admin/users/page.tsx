"use client";

import { useState } from "react";
import { useDeferredEffect } from "@/hooks/useDeferredEffect";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "content_editor" });

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => {
        if (r.status === 403) { setForbidden(true); return []; }
        return r.json();
      })
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useDeferredEffect(() => { fetchUsers(); }, []);

  const handleSave = async () => {
    const url = editing ? `/api/admin/users/${editing._id}` : "/api/admin/users";
    const body = editing ? { ...form, password: form.password || undefined } : form;
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editing ? "User updated" : "User created");
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", email: "", password: "", role: "content_editor" });
      fetchUsers();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/users/${deleteId}`, { method: "DELETE" });
    if (res.ok) { toast.success("User deactivated"); setDeleteId(null); fetchUsers(); }
    else toast.error("Delete failed");
  };

  if (forbidden || session?.user?.role !== "super_admin") {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-white">
        <p className="text-muted-foreground">Access restricted to super administrators.</p>
      </div>
    );
  }

  const columns: Column<AdminUser>[] = [
    { key: "name", header: "Name", render: (row) => <span className="font-medium">{row.name}</span> },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", render: (row) => <span className="capitalize">{row.role.replace("_", " ")}</span> },
    { key: "status", header: "Status", render: (row) => <span className={`rounded-full px-2 py-0.5 text-xs ${row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>{row.isActive ? "Active" : "Inactive"}</span> },
    { key: "actions", header: "", render: (row) => (
      <div className="flex gap-2">
        <button type="button" onClick={() => { setEditing(row); setForm({ name: row.name, email: row.email, password: "", role: row.role }); setShowForm(true); }} className="text-primary"><Pencil className="h-4 w-4" /></button>
        <button type="button" onClick={() => setDeleteId(row._id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={() => { setEditing(null); setForm({ name: "", email: "", password: "", role: "content_editor" }); setShowForm(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>
      <DataTable columns={columns} data={users} loading={loading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-elevated">
            <h3 className="text-lg font-semibold">{editing ? "Edit" : "Add"} User</h3>
            <div className="mt-4 space-y-4">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
              <input placeholder={editing ? "New Password (optional)" : "Password"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                <option value="content_editor">Content Editor</option>
                <option value="manager">Manager</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button type="button" onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteId} title="Deactivate User" description="This user will no longer be able to log in." confirmLabel="Deactivate" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
