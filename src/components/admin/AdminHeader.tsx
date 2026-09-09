"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

interface AdminHeaderProps {
  user?: { name?: string | null; email?: string | null; role?: string };
  title?: string;
}

export function AdminHeader({ user, title }: AdminHeaderProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
    toast.success("Logged out");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <h1 className="text-xl font-semibold text-foreground">{title || "Dashboard"}</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
