import React from "react";
import Page from "../../../Components/Page/Page";
import DashboardHeader from "./DashboardHeader";
import MemberLookup from "./MemberLookup";
import DashboardAdmin from "./DashboardAdmin";
import DashboardEvents from "./DashboardEvents";
import DashboardInvoices from "./DashboardInvoices";

/**
 * Admin Dashboard (single page, UI-only)
 * - Assumes TopBar exists globally outside this page
 * - TailwindCSS only
 * - No real data fetching; buttons/inputs are purely visual
 */

export default function AdminDashboardOnePage() {
  return (
    <Page>
      <div className="min-h-[calc(100vh-64px)]  text-white ">
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          <DashboardHeader />

          {/* Stats strip */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Active Members" value="2,418" hint="+4.2% this month" />
            <StatCard label="Admins" value="9" hint="2 pending invites" />
            <StatCard label="Upcoming Events" value="6" hint="Next: Jan 12" />
            <StatCard label="Unpaid Invoices" value="14" hint="$1,246 outstanding" />
          </div>

          {/* Main grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            <MemberLookup />
            <DashboardAdmin />
            <DashboardEvents />
            <DashboardInvoices />
          </div>
        </div>
      </div>
    </Page>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#0F1620] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] h-full">
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-[#0F1620] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <div className="text-xs font-semibold tracking-wide text-white/50">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-orange-200">{value}</div>
      {hint ? <div className="mt-1 text-sm text-white/60">{hint}</div> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "orange";
}) {
  const map: Record<string, string> = {
    neutral: "border-white/10 bg-white/5 text-white/70",
    good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    warn: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
    bad: "border-red-500/30 bg-red-500/10 text-red-200",
    orange: "border-orange-500/30 bg-orange-500/10 text-orange-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${map[tone]}`}
    >
      {children}
    </span>
  );
}
