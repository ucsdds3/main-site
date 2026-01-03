import Input from "../../../Components/Input";
import Select from "../../../Components/Select";
import { Badge, Card } from "./Admin";
import DashboardButton from "./DashboardButton";
import DashboardSectionHeader from "./DashboardSectionHeader";

export default function DashboardAdmin() {
  return (
    <section className="lg:col-span-6 relative">
      <Card>
        <DashboardSectionHeader
          title="Admin Management"
          subtitle="Invite admins, set roles, remove access (UI-only)."
          actions={<DashboardButton variant="orange">Invite Admin</DashboardButton>}
        />

        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Admin email" className="w-full min-w-0" />
          <Select
            label="Role"
            options={["Admin", "Super Admin", "Billing", "Events", "Read-only"]}
            className="w-full min-w-0 h-min"
          />
          <DashboardButton variant="orange" className="h-12 mt-auto">
            Send Invite
          </DashboardButton>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {["Alex", "Sam", "Jordan", "Riley"].map((name, i) => (
                <tr key={name} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-white/50">{name.toLowerCase()}@org.com</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={i === 0 ? "orange" : "neutral"}>
                      {i === 0 ? "Super Admin" : "Admin"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="good">Active</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <DashboardButton variant="ghost">Edit</DashboardButton>
                      <DashboardButton variant="ghost">Remove</DashboardButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="absolute w-max bottom-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="text-sm font-semibold text-red-200">Danger Zone (UI)</div>
          <p className="mt-1 text-sm text-white/70">
            Removing the last Super Admin can lock you out.
          </p>
          <div className="mt-3">
            <DashboardButton variant="ghost">View Audit Log</DashboardButton>
          </div>
        </div>
      </Card>
    </section>
  );
}
