"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/menu": "Menu Items",
  "/admin/menu/categories": "Categories",
  "/admin/menu/import": "Import Menu",
  "/admin/services": "Services",
  "/admin/testimonials": "Testimonials",
  "/admin/bookings": "Bookings",
  "/admin/inquiries": "Inquiries",
  "/admin/media": "Media Library",
  "/admin/content": "Page Content",
  "/admin/navigation": "Navigation",
  "/admin/settings": "Site Settings",
  "/admin/seo": "SEO Settings",
  "/admin/users": "User Management",
  "/admin/audit-logs": "Audit Logs",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const title = pageTitles[pathname] || "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-warm-cream">
      <AdminSidebar userRole={session?.user?.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader user={session?.user} title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
