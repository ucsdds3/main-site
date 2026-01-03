import DashboardButton from "./DashboardButton";
export default function DashboardHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">
          Member lookup, admin controls, events, and invoices (UI-only).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <DashboardButton>Export</DashboardButton>
        <DashboardButton variant="orange">Quick Create</DashboardButton>
      </div>
    </div>
  );
}
