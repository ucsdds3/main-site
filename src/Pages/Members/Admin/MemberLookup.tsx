import Input from "../../../Components/Input";
import Select from "../../../Components/Select";
import { Badge, Card } from "./Admin";
import DashboardButton from "./DashboardButton";
import DashboardSectionHeader from "./DashboardSectionHeader";

export default function MemberLookup() {
  return (
    <>
      <section className="lg:col-span-7">
        <Card>
          <DashboardSectionHeader
            title="Member Lookup"
            subtitle="Search by name, email, or member ID. Filter by tier and status."
            actions={
              <div className="flex gap-2">
                <DashboardButton>Create Member</DashboardButton>
                <DashboardButton variant="orange">View Selected</DashboardButton>
              </div>
            }
          />

          <div className="grid gap-3 md:grid-cols-3">
            <Input label="Search (name, email, ID)..." className="w-full min-w-0" />
            <Select
              label="Status"
              options={["Any", "Active", "Inactive", "Banned"]}
              className="w-full min-w-0 h-min"
            />
            <Select
              label="Tier"
              options={["Any", "Rookie", "Bronze", "Silver", "Gold"]}
              className="w-full min-w-0 h-min"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Verified</Badge>
            <Badge tone="orange">High Points</Badge>
            <Badge>Has Invoice</Badge>
            <Badge>Recent Event</Badge>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Points</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="font-medium">Member Name {i + 1}</div>
                      <div className="text-xs text-white/50">member{i + 1}@email.com</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>Rookie</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="good">Active</Badge>
                    </td>
                    <td className="px-4 py-3">1,240</td>
                    <td className="px-4 py-3 text-right">
                      <DashboardButton variant="ghost">Select</DashboardButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="lg:col-span-5">
        <Card>
          <DashboardSectionHeader
            title="Selected Member"
            subtitle="Details panel (UI)."
            actions={<Badge tone="good">Active</Badge>}
          />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Viet Minh Hieu Nguyen</div>
                <div className="mt-1 text-sm text-white/60">viet@email.com • ID: 000123</div>
              </div>
              <Badge tone="orange">Rookie</Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Meta label="XP" value="240 / 1000" />
              <Meta label="Points" value="0" />
              <Meta label="Joined" value="2025-09-12" />
              <Meta label="Last Seen" value="2025-12-30" />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0F1620] p-4">
            <div className="text-sm font-semibold">Member Controls (UI)</div>
            <div className="mt-3 space-y-2">
              <ToggleRow label="Can check-in events" />
              <ToggleRow label="Can redeem points" />
              <ToggleRow label="Marketing emails" />
            </div>
            <div className="mt-4 flex gap-2">
              <DashboardButton>Reset Password</DashboardButton>
              <DashboardButton variant="orange">Flag Account</DashboardButton>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold">Internal Notes (UI)</div>
            <textarea
              className="mt-2 h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 outline-none placeholder:text-white/40 focus:border-orange-500/40"
              placeholder="Add internal notes about this member…"
            />
            <div className="mt-3 flex gap-2">
              <DashboardButton>Save Note</DashboardButton>
              <DashboardButton variant="ghost">Clear</DashboardButton>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/50">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function ToggleRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0F1620] px-3 py-2">
      <span className="text-sm text-white/75">{label}</span>
      <div className="h-6 w-11 rounded-full bg-white/10 p-1">
        <div className="h-4 w-4 rounded-full bg-white/40" />
      </div>
    </div>
  );
}
