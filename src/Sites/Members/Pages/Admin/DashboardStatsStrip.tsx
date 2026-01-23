export default function DashboardStatsStrip() {
  return (
    <div className="opacity-10 grid gap-4 md:grid-cols-4">
      <StatCard label="Active Members" value="2,418" hint="+4.2% this month" />
      <StatCard label="Admins" value="9" hint="2 pending invites" />
      <StatCard label="Upcoming Events" value="6" hint="Next: Jan 12" />
      <StatCard label="Unpaid Invoices" value="14" hint="$1,246 outstanding" />
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-[#0F1620] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <div className="text-xs font-semibold tracking-wide text-white/50">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-orange-200">{value}</div>
      {hint ? <div className="mt-1 text-sm text-white/60">{hint}</div> : null}
    </div>
  );
}
