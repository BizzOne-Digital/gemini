"use client";

import { useEffect, useState } from "react";
import {
  UtensilsCrossed,
  CalendarDays,
  Mail,
  MessageSquareQuote,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { format } from "date-fns";

interface DashboardData {
  stats: {
    totalMenuItems: number;
    activeMenuItems: number;
    unavailableItems: number;
    newBookings: number;
    pendingBookings: number;
    newInquiries: number;
    pendingTestimonials: number;
  };
  recentBookings: Array<{ _id: string; fullName: string; status: string; createdAt: string; referenceNumber: string }>;
  recentInquiries: Array<{ _id: string; fullName: string; reason: string; createdAt: string }>;
  recentActivity: Array<{ _id: string; action: string; entity: string; performedByEmail: string; createdAt: string }>;
}

const COLORS = ["#1f5b3a", "#5e8f4e", "#e8b84a", "#c85b3c"];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="text-destructive">Failed to load dashboard</div>;
  }

  const { stats } = data;
  const menuChartData = [
    { name: "Available", value: stats.activeMenuItems },
    { name: "Unavailable", value: stats.unavailableItems },
  ];

  const activityChartData = [
    { name: "New Bookings", count: stats.newBookings },
    { name: "Pending Bookings", count: stats.pendingBookings },
    { name: "New Inquiries", count: stats.newInquiries },
    { name: "Pending Reviews", count: stats.pendingTestimonials },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Menu Items" value={stats.totalMenuItems} icon={UtensilsCrossed} />
        <StatCard title="New Bookings" value={stats.newBookings} icon={CalendarDays} variant="gold" trend="Awaiting review" />
        <StatCard title="New Inquiries" value={stats.newInquiries} icon={Mail} />
        <StatCard title="Pending Reviews" value={stats.pendingTestimonials} icon={MessageSquareQuote} variant="gold" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">Menu Availability</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={menuChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {menuChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold">Pending Actions</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1f5b3a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <CalendarDays className="h-5 w-5 text-primary" />
            Recent Bookings
          </h2>
          <ul className="space-y-3">
            {data.recentBookings.length === 0 ? (
              <li className="text-sm text-muted-foreground">No recent bookings</li>
            ) : (
              data.recentBookings.map((b) => (
                <li key={b._id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.fullName}</p>
                    <p className="text-xs text-muted-foreground">{b.referenceNumber}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                    {b.status}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Mail className="h-5 w-5 text-primary" />
            Recent Inquiries
          </h2>
          <ul className="space-y-3">
            {data.recentInquiries.length === 0 ? (
              <li className="text-sm text-muted-foreground">No recent inquiries</li>
            ) : (
              data.recentInquiries.map((inq) => (
                <li key={inq._id} className="border-b border-border pb-2 last:border-0">
                  <p className="text-sm font-medium">{inq.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{inq.reason.replace("_", " ")}</p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <AlertCircle className="h-5 w-5 text-primary" />
            Recent Activity
          </h2>
          <ul className="space-y-3">
            {data.recentActivity.length === 0 ? (
              <li className="text-sm text-muted-foreground">No recent activity</li>
            ) : (
              data.recentActivity.map((log) => (
                <li key={log._id} className="border-b border-border pb-2 last:border-0">
                  <p className="text-sm">
                    <span className="font-medium capitalize">{log.action}</span> {log.entity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.performedByEmail} · {format(new Date(log.createdAt), "MMM d, h:mm a")}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
