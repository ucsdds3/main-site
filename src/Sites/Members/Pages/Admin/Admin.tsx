import React from "react";
import Page from "src/Shared/Page/Page";
import DashboardStatsStrip from "./DashboardStatsStrip";

export default function AdminDashboardOnePage() {
  return (
    <Page data-theme="dark">
      <div className="min-h-[calc(100vh-64px)] text-white ">
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          <h1 className="text-4xl text-center font-semibold mb-4">Admin Dashboard</h1>
          <DashboardStatsStrip />
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            
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
