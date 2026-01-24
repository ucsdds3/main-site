import { useAdminStats } from "../Hooks/useAdminStats";

export default function DashboardStatsStrip() {
  const stats = useAdminStats();

  return (
    <div className={`flex w-full flex-wrap gap-4 ${Object.keys(stats).length}`}>
      {Object.entries(stats).map(([label, stats]) => (
        <StatCard key={label} label={label} {...stats} />
      ))}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  loading: boolean;
}
function StatCard({ label, value, hint, loading }: StatCardProps) {
  return (
    <div className="flex-1 min-w-[200px] rounded-2xl bg-[#0F1620] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <div className="text-lg font-semibold tracking-wide">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-primary">
        {loading ? <span className="loading loading-dots loading-sm" /> : value}
      </div>
      {hint && !loading ? (
        <div
          className={`mt-1 ${hint[0] === "+" ? "text-green-500" : hint[0] === "-" ? "text-red-500" : "text-primary"}`}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}
