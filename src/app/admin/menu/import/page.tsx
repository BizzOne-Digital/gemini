"use client";

import { useEffect, useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ImportJob {
  _id: string;
  filename: string;
  status: string;
  mode: string;
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  importedBy: string;
  createdAt: string;
}

export default function MenuImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState("upsert");
  const [dryRun, setDryRun] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number; errors: Array<{ row: number; message: string }> } | null>(null);
  const [history, setHistory] = useState<ImportJob[]>([]);

  useEffect(() => {
    fetch("/api/admin/menu/import").then((r) => r.json()).then(setHistory);
  }, []);

  const handleImport = async () => {
    if (!file) return toast.error("Select a file first");
    setImporting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    formData.append("dryRun", String(dryRun));

    try {
      const res = await fetch("/api/admin/menu/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
      toast.success(dryRun ? "Dry run completed" : "Import completed");
      fetch("/api/admin/menu/import").then((r) => r.json()).then(setHistory);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const expectedColumns = ["Category", "Item Name", "Price", "Description", "Sale Price", "Available", "Featured", "Popular"];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">Upload Excel File</h2>
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 hover:border-primary/50">
              <FileSpreadsheet className="mb-2 h-10 w-10 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{file ? file.name : "Choose .xlsx file"}</span>
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>

            <div>
              <label className="mb-1 block text-sm font-medium">Import Mode</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                <option value="upsert">Upsert (create or update)</option>
                <option value="create">Create only</option>
                <option value="update">Update only</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="rounded" />
              Dry run (preview without saving)
            </label>

            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !file}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {importing ? "Processing..." : dryRun ? "Run Preview" : "Import Menu"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">Expected Columns</h2>
          <ul className="space-y-2">
            {expectedColumns.map((col) => (
              <li key={col} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-fresh-leaf" />
                {col}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Additional columns: Slug, Subcategory, Image URL, Dietary Tags, Allergens, SKU, Variants, Add-ons
          </p>
        </div>
      </div>

      {result && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">Import Results</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{result.created}</p>
              <p className="text-sm text-green-600">Created</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
              <p className="text-sm text-blue-600">Updated</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-700">{result.skipped}</p>
              <p className="text-sm text-gray-600">Skipped</p>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-destructive">Errors ({result.errors.length})</h3>
              <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
                {result.errors.slice(0, 20).map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <XCircle className="h-3 w-3 shrink-0 text-destructive" />
                    Row {err.row}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Import History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No import history yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left">File</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Mode</th>
                  <th className="px-3 py-2 text-left">Results</th>
                  <th className="px-3 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((job) => (
                  <tr key={job._id} className="border-b border-border">
                    <td className="px-3 py-2">{job.filename}</td>
                    <td className="px-3 py-2 capitalize">{job.status}</td>
                    <td className="px-3 py-2 capitalize">{job.mode.replace("_", " ")}</td>
                    <td className="px-3 py-2">{job.created}C / {job.updated}U / {job.skipped}S</td>
                    <td className="px-3 py-2">{format(new Date(job.createdAt), "MMM d, yyyy h:mm a")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
