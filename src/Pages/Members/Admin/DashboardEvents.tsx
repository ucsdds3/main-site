import Input from "../../../Components/Input";
import Select from "../../../Components/Select";
import { Badge, Card } from "./Admin";
import DashboardButton from "./DashboardButton";
import DashboardSectionHeader from "./DashboardSectionHeader";

export default function DashboardEvents() {
  return (
    <section className="lg:col-span-6">
      <Card>
        <DashboardSectionHeader
          title="Events"
          subtitle="Create, publish, and archive events (UI-only)."
          actions={
            <div className="flex gap-2">
              <DashboardButton>Import</DashboardButton>
              <DashboardButton variant="orange">Create Event</DashboardButton>
            </div>
          }
        />

        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Event name" className="w-full min-w-0" />
          <Input label="Location" className="w-full min-w-0" />
          <Input label="Start date (YYYY-MM-DD)" className="w-full min-w-0" />
          <Input label="Start time (HH:MM)" className="w-full min-w-0" />
          <Select
            label="Visibility"
            options={["Public", "Members-only", "Private"]}
            className="w-full min-w-0 h-min"
          />
          <Input label="Check-in code (optional)" className="w-full min-w-0" />
        </div>

        <div className="mt-4 flex gap-2">
          <DashboardButton variant="orange">Save Draft</DashboardButton>
          <DashboardButton variant="orange">Publish</DashboardButton>
          <DashboardButton variant="ghost">Reset</DashboardButton>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Check-ins</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-medium">Workshop {i + 1}</div>
                    <div className="text-xs text-white/50">Room 2xx • Members-only</div>
                  </td>
                  <td className="px-4 py-3">2026-01-{10 + i}</td>
                  <td className="px-4 py-3">
                    <Badge tone={i % 2 === 0 ? "good" : "neutral"}>
                      {i % 2 === 0 ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{Math.floor(Math.random() * 120)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <DashboardButton variant="ghost">Edit</DashboardButton>
                      <DashboardButton variant="ghost">Archive</DashboardButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
