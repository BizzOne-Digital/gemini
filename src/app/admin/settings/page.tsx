"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LocalImageField } from "@/components/admin/LocalImageField";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => { reset(data); setLoading(false); });
  }, [reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) toast.success("Settings saved");
    else toast.error("Save failed");
    setSaving(false);
  };

  if (loading) return <div className="text-muted-foreground">Loading settings...</div>;

  const logoMain = watch("logos.main");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Business Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium">Public Name</label><input {...register("publicBusinessName")} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm font-medium">Legal Name</label><input {...register("legalBusinessName")} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm font-medium">Email</label><input {...register("primaryEmail")} type="email" className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm font-medium">Phone</label><input {...register("phone")} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium">Address</label><input {...register("address")} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm font-medium">City</label><input {...register("city")} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm font-medium">Province</label><input {...register("province")} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm font-medium">Postal Code</label><input {...register("postalCode")} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm font-medium">Timezone</label><input {...register("timezone")} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Branding</h2>
        <LocalImageField folder="misc" label="Main Logo" value={logoMain} onChange={(url) => setValue("logos.main", url)} />
        <div className="mt-4"><label className="mb-1 block text-sm font-medium">Footer Description</label><textarea {...register("footerDescription")} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Features</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("bookingEnabled")} /> Booking Enabled</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("cateringEnabled")} /> Catering Enabled</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("newsletterEnabled")} /> Newsletter Enabled</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("cookieConsentEnabled")} /> Cookie Consent</label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Social & Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium">Facebook URL</label><input {...register("facebookUrl")} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-sm font-medium">Order Online URL</label><input {...register("orderOnlineUrl")} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></div>
        </div>
      </section>

      <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50">
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
