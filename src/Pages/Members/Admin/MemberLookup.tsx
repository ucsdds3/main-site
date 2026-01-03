import { useEffect, useState } from "react";
import Input from "../../../Components/Input";
import Select from "../../../Components/Select";
import { Badge, Card } from "./Admin";
import DashboardButton from "./DashboardButton";
import DashboardSectionHeader from "./DashboardSectionHeader";
import { PortalMemberType } from "../../../Utils/types";
import { supabase } from "../../../Utils/supabase";
import toast from "react-hot-toast";
import { useTriggerFetchAdmin } from "../../../Hooks/Members/Admin/useTriggerFetchAdmin";

const defaultSelection: PortalMemberType = {
  id: 0,
  name: "John Doe",
  points: 0,
  xp: 0,
  deleted: false,
  created_at: "",
  updated_at: "",
  email: "JohnDoe@Hotmail.com",
  admin_level: 0,
};
export default function MemberLookup() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [members, setMembers] = useState<PortalMemberType[]>([]);
  const [selected, setSelected] = useState<PortalMemberType>(defaultSelection);
  const { triggerFetchAdmin, triggerFetchAdminNow } = useTriggerFetchAdmin();
  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("Members")
        .select("id,name:full_name,points,xp,deleted,created_at,updated_at,email,admin_level")
        .order("points", { ascending: false });
      if (data) {
        setMembers(data);
      }
    };
    fetchMembers();
  }, [triggerFetchAdmin]);

  const submitForm = async () => {
    const { data } = await supabase
      .from("Members")
      .select("id,name:full_name,points,xp,deleted,created_at,updated_at,email,admin_level")
      .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    if (data) {
      setMembers(data);
    }
  };

  const updateAdmin = async () => {
    const { error } = await supabase
      .from("Members")
      .update({ admin_level: selected.admin_level ? null : 1 })
      .eq("id", selected.id);
    if (error) toast.error(error.message);
    else {
      setSelected({ ...selected, admin_level: selected.admin_level ? null : 1 });
      triggerFetchAdminNow();
    }
  };

  return (
    <>
      <section className="lg:col-span-7">
        <Card>
          <DashboardSectionHeader
            title="Member Lookup"
            subtitle="Search by name or email Filter by tier and status."
          />

          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={e => {
              e.preventDefault();
              submitForm();
            }}
          >
            <Input
              label="Search (name, email)..."
              className="w-full min-w-0"
              value={search}
              setValue={setSearch}
            />
            <Select
              label="Status"
              options={["Any", "Active", "Inactive"]}
              className="w-full min-w-0 h-min"
              value={statusFilter}
              setValue={setStatusFilter}
            />
            <Select
              label="Tier"
              options={["Any", "Rookie", "Bronze", "Silver", "Gold"]}
              className="w-full min-w-0 h-min"
              value={tierFilter}
              setValue={setTierFilter}
            />
            <DashboardButton variant="orange" className="w-min">
              submit
            </DashboardButton>
          </form>

          <div className="mt-5 overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 max-h-[520px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr className="">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Points</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 max-h-[800px] overflow-y-auto ">
                {members.map((member, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-white/50">{member.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>Rookie</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={member.deleted ? "bad" : "good"}>
                        {member.deleted ? "Inactive" : "active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{member.points}</td>
                    <td className="px-4 py-3 text-right">
                      <DashboardButton
                        variant="ghost"
                        onClick={() => {
                          console.log(member);
                          setSelected(member);
                        }}
                      >
                        Select
                      </DashboardButton>
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
            actions={
              <Badge tone={selected?.deleted ? "bad" : "good"}>
                {selected?.deleted ? "Inactive" : "active"}
              </Badge>
            }
          />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{selected.name}</div>
                <div className="mt-1 text-sm text-white/60">
                  {selected.email} • ID: {selected.id}
                </div>
              </div>
              <Badge tone="orange">Rookie</Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 ">
              <Meta label="XP" value={`${selected.xp} / 1000`} />
              <Meta label="Points" value={`${selected.points}`} />
              <Meta label="Joined" value={selected.created_at.split("T")[0]} />
              <Meta label="Last Updated" value={selected.updated_at.split("T")[0]} />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0F1620] p-4">
            <div className="text-sm font-semibold">Member Controls (UI)</div>
            <div className="mt-3 space-y-2">
              <ToggleRow
                label="is admin"
                checked={selected.admin_level != null}
                onClick={updateAdmin}
              />
            </div>
            {/* <div className="mt-4 flex gap-2">
              <DashboardButton>Reset Password</DashboardButton>
            </div> */}
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

function ToggleRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  console.log(checked);
  return (
    <fieldset className="fieldset rounded-box w-64 ">
      <label className="label">
        <input
          type="checkbox"
          defaultChecked
          className="toggle toggle-primary"
          checked={checked}
          onClick={onClick}
        />
        {label}
      </label>
    </fieldset>
  );
}
