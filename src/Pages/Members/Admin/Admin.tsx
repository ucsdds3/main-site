import React from "react";
import Page from "../../../Components/Page/Page";

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
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-white/60">
              Member lookup, admin controls, events, and invoices (UI-only).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>Export</Button>
            <Button variant="orange">Quick Create</Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Active Members" value="2,418" hint="+4.2% this month" />
          <StatCard label="Admins" value="9" hint="2 pending invites" />
          <StatCard label="Upcoming Events" value="6" hint="Next: Jan 12" />
          <StatCard label="Unpaid Invoices" value="14" hint="$1,246 outstanding" />
        </div>

        {/* Main grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* LEFT: Members */}
          <section className="lg:col-span-7">
            <Card>
              <SectionHeader
                title="Member Lookup"
                subtitle="Search by name, email, or member ID. Filter by tier and status."
                actions={
                  <div className="flex gap-2">
                    <Button>Create Member</Button>
                    <Button variant="orange">View Selected</Button>
                  </div>
                }
              />

              <div className="grid gap-3 md:grid-cols-3">
                <Input placeholder="Search (name, email, ID)..." />
                <Select>
                  <option>Status: Any</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Banned</option>
                </Select>
                <Select>
                  <option>Tier: Any</option>
                  <option>Rookie</option>
                  <option>Bronze</option>
                  <option>Silver</option>
                  <option>Gold</option>
                </Select>
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
                    {Array.from({ length: 6 }).map((_, i) => (
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
                          <Button variant="ghost">Select</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* RIGHT: Selected member details */}
          <section className="lg:col-span-5">
            <Card>
              <SectionHeader
                title="Selected Member"
                subtitle="Details panel (UI)."
                actions={<Badge tone="good">Active</Badge>}
              />

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">Viet Minh Hieu Nguyen</div>
                    <div className="mt-1 text-sm text-white/60">
                      viet@email.com • ID: 000123
                    </div>
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
                  <Button>Reset Password</Button>
                  <Button variant="orange">Flag Account</Button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold">Internal Notes (UI)</div>
                <textarea
                  className="mt-2 h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 outline-none placeholder:text-white/40 focus:border-orange-500/40"
                  placeholder="Add internal notes about this member…"
                />
                <div className="mt-3 flex gap-2">
                  <Button>Save Note</Button>
                  <Button variant="ghost">Clear</Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Admins */}
          <section className="lg:col-span-6">
            <Card>
              <SectionHeader
                title="Admin Management"
                subtitle="Invite admins, set roles, remove access (UI-only)."
                actions={<Button variant="orange">Invite Admin</Button>}
              />

              <div className="grid gap-3 md:grid-cols-3">
                <Input placeholder="Admin email" />
                <Select>
                  <option>Role: Admin</option>
                  <option>Super Admin</option>
                  <option>Billing</option>
                  <option>Events</option>
                  <option>Read-only</option>
                </Select>
                <Button variant="orange">Send Invite</Button>
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
                            <Button variant="ghost">Edit</Button>
                            <Button variant="ghost">Remove</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="text-sm font-semibold text-red-200">Danger Zone (UI)</div>
                <p className="mt-1 text-sm text-white/70">
                  Removing the last Super Admin can lock you out.
                </p>
                <div className="mt-3">
                  <Button variant="ghost">View Audit Log</Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Events */}
          <section className="lg:col-span-6">
            <Card>
              <SectionHeader
                title="Events"
                subtitle="Create, publish, and archive events (UI-only)."
                actions={
                  <div className="flex gap-2">
                    <Button>Import</Button>
                    <Button variant="orange">Create Event</Button>
                  </div>
                }
              />

              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Event name" />
                <Input placeholder="Location" />
                <Input placeholder="Start date (YYYY-MM-DD)" />
                <Input placeholder="Start time (HH:MM)" />
                <Select>
                  <option>Visibility: Public</option>
                  <option>Members-only</option>
                  <option>Private</option>
                </Select>
                <Input placeholder="Check-in code (optional)" />
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="orange">Save Draft</Button>
                <Button variant="orange">Publish</Button>
                <Button variant="ghost">Reset</Button>
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
                            <Button variant="ghost">Edit</Button>
                            <Button variant="ghost">Archive</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Invoices (full width) */}
          <section className="lg:col-span-12">
            <Card>
              <SectionHeader
                title="Invoices"
                subtitle="Filter, search, and view invoice details (UI-only)."
                actions={
                  <div className="flex gap-2">
                    <Button>Export CSV</Button>
                    <Button variant="orange">Create Invoice</Button>
                  </div>
                }
              />

              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Select>
                    <option>Status: Any</option>
                    <option>Paid</option>
                    <option>Unpaid</option>
                    <option>Overdue</option>
                  </Select>
                  <Select>
                    <option>Range: Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Year to date</option>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Search by member / invoice #" />
                  <Button>Filter</Button>
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
                            <Badge tone={tone as any}>{status}</Badge>
                          </td>
                          <td className="px-4 py-3">2026-02-{String(5 + i).padStart(2, "0")}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost">View</Button>
                              <Button variant="ghost">Mark Paid</Button>
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
                  <Button variant="orange">Open Drawer</Button>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
</Page>
  );
}

/* ----------------------------- UI Building Blocks ----------------------------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#0F1620] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
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

function Button({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "orange" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition border";
  const styles: Record<string, string> = {
    default: "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
    orange: "border-orange-500/40 bg-orange-500/15 text-orange-200 hover:bg-orange-500/20",
    ghost: "border-transparent bg-transparent text-white/70 hover:bg-white/5",
  };

  return <button className={`${base} ${styles[variant]}`}>{children}</button>;
}

function Input({ placeholder }: { placeholder?: string }) {
  return (
    <input
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 outline-none placeholder:text-white/40 focus:border-orange-500/40"
    />
  );
}

function Select({ children }: { children: React.ReactNode }) {
  return (
    <select className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 outline-none focus:border-orange-500/40">
      {children}
    </select>
  );
}

function Badge({
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
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${map[tone]}`}>
      {children}
    </span>
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
