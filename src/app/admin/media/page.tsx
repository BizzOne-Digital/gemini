"use client";

import { useCallback, useState } from "react";
import { useDeferredEffect } from "@/hooks/useDeferredEffect";
import Image from "next/image";
import { Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LocalImageField } from "@/components/admin/LocalImageField";
import { format } from "date-fns";
import type { StoredUploadFolder } from "@/models/StoredUpload";

interface MediaAsset {
  _id: string;
  url: string;
  filename: string;
  folder: string;
  format: string;
  bytes: number;
  createdAt: string;
}

const folders: StoredUploadFolder[] = ["products", "gallery", "pages", "misc"];

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState<StoredUploadFolder>("gallery");
  const [uploadKey, setUploadKey] = useState(0);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "24" });
    if (folder) params.set("folder", folder);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/media?${params}`);
    const data = await res.json();
    setAssets(data.assets || []);
    setPagination(data.pagination || { pages: 1, total: 0 });
    setLoading(false);
  }, [page, folder, search]);

  useDeferredEffect(() => { void fetchMedia(); }, [fetchMedia]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/media?id=${deleteId}`, { method: "DELETE" });
    if (res.ok) { toast.success("Media deleted"); setDeleteId(null); fetchMedia(); }
    else toast.error("Delete failed");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Upload New Image</h2>
        <div className="mb-4 max-w-xs">
          <label className="mb-1 block text-sm font-medium">Folder</label>
          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value as StoredUploadFolder)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {folders.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <LocalImageField
          key={uploadKey}
          folder={uploadFolder}
          value=""
          onChange={() => {
            fetchMedia();
            setUploadKey((k) => k + 1);
          }}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="rounded-lg border border-border py-2 pl-10 pr-4 text-sm" />
        </div>
        <select value={folder} onChange={(e) => { setFolder(e.target.value); setPage(1); }} className="rounded-lg border border-border px-3 py-2 text-sm">
          <option value="">All Folders</option>
          {folders.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading...</p>
      ) : assets.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No media found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <div key={asset._id} className="group overflow-hidden rounded-xl border border-border bg-white shadow-soft">
              <div className="relative aspect-square">
                <Image src={asset.url} alt={asset.filename} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                <button type="button" onClick={() => setDeleteId(asset._id)} className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{asset.filename}</p>
                <p className="text-xs text-muted-foreground">{asset.folder} · {format(new Date(asset.createdAt), "MMM d")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Previous</button>
          <span className="px-4 py-2 text-sm">Page {page} of {pagination.pages}</span>
          <button type="button" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Next</button>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Media" description="This will permanently delete the stored image." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
