import {Input} from "../../../Components/Input";
import Select from "../../../Components/Select";
import { Badge, Card } from "./Admin";
import DashboardButton from "./DashboardButton";
import DashboardSectionHeader from "./DashboardSectionHeader";

export default function DashboardInvoices() {
  return (
    <section className="lg:col-span-12">
      <Card>
        <DashboardSectionHeader
          title="Invoices"
          subtitle="Filter, search, and view invoice details (UI-only)."
          actions={
            <div className="flex gap-2">
              <DashboardButton>Export CSV</DashboardButton>
              <DashboardButton variant="orange">Create Invoice</DashboardButton>
            </div>
          }
        />

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <Select
              label="Status"
              options={["Any", "Paid", "Unpaid", "Overdue"]}
              className="w-1/2 min-w-0 h-min"
            />
            <Select
              label="Range"
              options={["Last 30 days", "Last 90 days", "Year to date"]}
              className="w-1/2 min-w-0 h-min"
            />
          </div>
          <div className="flex gap-2">
            <Input label="Search by member / invoice #" />
            <DashboardButton className="h-auto py-3 mt-auto">Filter</DashboardButton>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {Array.from({ length: 8 }).map((_, i) => {
                const status = i % 3 === 0 ? "Overdue" : i % 3 === 1 ? "Unpaid" : "Paid";
                const tone = status === "Paid" ? "good" : status === "Unpaid" ? "warn" : "bad";
                return (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="font-medium">INV-00{i + 20}</div>
                      <div className="text-xs text-white/50">Membership renewal</div>
                    </td>
                    <td className="px-4 py-3">Member {i + 1}</td>
                    <td className="px-4 py-3">${(49 + i * 10).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={tone as "good" | "warn" | "bad" | "neutral" | "orange" | undefined}
                      >
                        {status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">2026-02-{String(5 + i).padStart(2, "0")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <DashboardButton variant="ghost">View</DashboardButton>
                        <DashboardButton variant="ghost">Mark Paid</DashboardButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* UI-only: "drawer" preview stub */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Invoice Detail Drawer (UI stub)</div>
              <div className="mt-1 text-sm text-white/60">
                Click “View” would open a drawer here in a real implementation.
              </div>
            </div>
            <DashboardButton variant="orange">Open Drawer</DashboardButton>
          </div>
        </div>
      </Card>
    </section>
  );
}
