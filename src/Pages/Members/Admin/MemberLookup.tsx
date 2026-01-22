import { useEffect, useState, useMemo } from "react";
import { Input } from "../../../Components/Input";
import Select from "../../../Components/Select";
import { Card } from "./Admin";
import DashboardButton from "./DashboardButton";
import DashboardSectionHeader from "./DashboardSectionHeader";
import { PortalMemberType } from "../../../Utils/types";
import { supabase } from "../../../Utils/supabase";
import toast from "react-hot-toast";
import { useTriggerFetchAdmin } from "../../../Hooks/Members/Admin/useTriggerFetchAdmin";
import { IoIosArrowUp } from "react-icons/io";

const tiers = ["Rookie", "Bronze", "Silver", "Gold", "Platinum"];

function getTier(experience: number): string {
  const level = Math.max(Math.floor(Math.log2(experience / 1000)) + 1, 0);
  return tiers[level] || "Rookie";
}

const defaultSelection: PortalMemberType = {
  id: 0,
  name: "John Doe",
  points: 0,
  experience: 0,
  deleted: false,
  created_at: "",
  updated_at: "",
  email: "JohnDoe@Hotmail.com",
  admin_level: 0,
};
type SortColumn = "name" | "tier" | "status" | "points" | null;
type SortDirection = "asc" | "desc";

export default function MemberLookup() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [allMembers, setAllMembers] = useState<PortalMemberType[]>([]);
  const [selected, setSelected] = useState<PortalMemberType>(defaultSelection);
  const [sortColumn, setSortColumn] = useState<SortColumn>("points");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const { triggerFetchAdmin, triggerFetchAdminNow } = useTriggerFetchAdmin();

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("Members")
        .select("id,name:full_name,points,experience,deleted,created_at,updated_at,email,admin_level")
        .order("points", { ascending: false });
      if (data) {
        setAllMembers(data);
      }
    };
    fetchMembers();
  }, [triggerFetchAdmin]);

  const filteredMembers = useMemo(() => {
    return allMembers.filter(member => {
      // Search filter
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          member.name.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter && statusFilter !== "Any") {
        const isActive = !member.deleted;
        if (statusFilter === "Active" && !isActive) return false;
        if (statusFilter === "Inactive" && isActive) return false;
      }

      // Tier filter
      if (tierFilter && tierFilter !== "Any") {
        const memberTier = getTier(member.experience);
        if (memberTier !== tierFilter) return false;
      }

      return true;
    });
  }, [allMembers, search, statusFilter, tierFilter]);

  const sortedMembers = useMemo(() => {
    if (!sortColumn) return filteredMembers;

    const sorted = [...filteredMembers].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "tier":
          const tierA = getTier(a.experience);
          const tierB = getTier(b.experience);
          comparison = tierA.localeCompare(tierB);
          break;
        case "status":
          comparison = Number(a.deleted) - Number(b.deleted);
          break;
        case "points":
          comparison = a.points - b.points;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredMembers, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Set first member as selected by default or when current selection is not in filtered list
  useEffect(() => {
    if (sortedMembers.length > 0) {
      const isSelectedInFiltered = sortedMembers.some(m => m.id === selected.id);
      if (selected.id === 0 || !isSelectedInFiltered) {
        setSelected(sortedMembers[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedMembers]);

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
            title={`Member Lookup: ${sortedMembers.length} result${sortedMembers.length !== 1 ? 's' : ''} found`}
            subtitle="Search by name or email Filter by tier and status."
          />

          <div className="grid gap-3 md:grid-cols-3">
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
              options={["Any", "Rookie", "Bronze", "Silver", "Gold", "Platinum"]}
              className="w-full min-w-0 h-min"
              value={tierFilter}
              setValue={setTierFilter}
            />
          </div>

          <div className="mt-5 overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 max-h-[520px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full text-left text-sm">
              <thead className="bg-base-100 text-white/60 sticky top-0 z-10">
                <tr className="">
                  <th
                    className="px-4 py-3 bg-base-100 cursor-pointer hover:bg-white/10 select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Member
                      <IoIosArrowUp
                        className={`duration-300 transition-transform ${
                          sortColumn === "name"
                            ? `text-primary ${sortDirection === "desc" ? "rotate-180" : ""}`
                            : "text-white/40"
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 bg-base-100 cursor-pointer hover:bg-white/10 select-none"
                    onClick={() => handleSort("tier")}
                  >
                    <div className="flex items-center gap-2">
                      Tier
                      <IoIosArrowUp
                        className={`duration-300 transition-transform ${
                          sortColumn === "tier"
                            ? `text-primary ${sortDirection === "desc" ? "rotate-180" : ""}`
                            : "text-white/40"
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 bg-base-100 cursor-pointer hover:bg-white/10 select-none"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <IoIosArrowUp
                        className={`duration-300 transition-transform ${
                          sortColumn === "status"
                            ? `text-primary ${sortDirection === "desc" ? "rotate-180" : ""}`
                            : "text-white/40"
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 bg-base-100 cursor-pointer hover:bg-white/10 select-none"
                    onClick={() => handleSort("points")}
                  >
                    <div className="flex items-center gap-2">
                      Points
                      <IoIosArrowUp
                        className={`duration-300 transition-transform ${
                          sortColumn === "points"
                            ? `text-primary ${sortDirection === "desc" ? "rotate-180" : ""}`
                            : "text-white/40"
                        }`}
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sortedMembers.map((member, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/5 cursor-pointer"
                    onClick={() => {
                      console.log(member);
                      setSelected(member);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-white/50">{member.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="badge badge-primary">{getTier(member.experience)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`badge ${member.deleted ? "badge-error" : "badge-success"}`}>
                        {member.deleted ? "Inactive" : "active"}
                      </div>
                    </td>
                    <td className="px-4 py-3">{member.points}</td>
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
              <div className={`badge ${selected?.deleted ? "badge-error" : "badge-success"}`}>
                {selected?.deleted ? "Inactive" : "active"}
              </div>
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
              <div className="badge badge-primary">{getTier(selected.experience)}</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 ">
              <Meta label="XP" value={`${selected.experience} / 1000`} />
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
