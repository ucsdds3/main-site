import DashboardButton from "../../DashboardButton";
import DashboardSectionHeader from "../../DashboardSectionHeader";
import { Card } from "../../Admin";
import { PortalMemberType } from "src/Utils/types";
import { getTier, Meta, ToggleRow } from "../utils";
import { supabase } from "src/Utils/supabase";
import toast from "react-hot-toast";

interface MemberDetailsPanelProps {
  selected: PortalMemberType;
  onUpdate: (updated: PortalMemberType) => void;
}

export default function MemberDetailsPanel({ selected, onUpdate }: MemberDetailsPanelProps) {
  const updateAdmin = async () => {
    const { error } = await supabase
      .from("Members")
      .update({ admin_level: selected.admin_level ? null : 1 })
      .eq("id", selected.id);
    if (error) toast.error(error.message);
    else {
      onUpdate({ ...selected, admin_level: selected.admin_level ? null : 1 });
    }
  };

  return (
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
  );
}
