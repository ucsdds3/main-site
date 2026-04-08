import { useAdminStats } from "../Hooks/useAdminStats";

export default function DashboardStatsStrip() {
  const stats = useAdminStats();

  return (
    <div className="flex w-full flex-wrap gap-4 font-body">
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
    <div className="obs-panel min-w-[200px] flex-1 p-5 font-body">
      <div className="text-lg font-semibold tracking-wide text-(--obs-text-muted)">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-[#F58134]">
        {loading ? <span className="loading loading-dots loading-sm" /> : value}
      </div>
      {hint && !loading ? (
        <div
          className={`mt-1 ${hint.startsWith("+") ? "text-green-500" : hint.startsWith("-") ? "text-red-500" : "text-(--obs-text-muted)"}`}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}
