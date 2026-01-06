import { useEffect, useState } from "react";
import {Input} from "../../../Components/Input";
import { Badge, Card } from "./Admin";
import DashboardButton from "./DashboardButton";
import DashboardSectionHeader from "./DashboardSectionHeader";
import { supabase } from "../../../Utils/supabase";
import { PortalMemberType } from "../../../Utils/types";
import toast from "react-hot-toast";
import { useTriggerFetchAdmin } from "../../../Hooks/Members/Admin/useTriggerFetchAdmin";
export default function DashboardAdmin() {
  const [admins, setAdmins] = useState<PortalMemberType[]>([]);
  const [filtered, setFiltered] = useState<PortalMemberType[]>([]);
  const [search, setSearch] = useState("");
  const { triggerFetchAdmin, triggerFetchAdminNow } = useTriggerFetchAdmin();
  const removeAdmin = async (id: number) => {
    const { error } = await supabase.from("Members").update({ admin_level: null }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      triggerFetchAdminNow();
    }
  };
  useEffect(() => {
    const fetchAdmins = async () => {
      const { data } = await supabase
        .from("Members")
        .select("id,name:full_name,points,xp,deleted,created_at,updated_at,email,admin_level")
        .not("admin_level", "is", null)
        .order("points", { ascending: false });
      if (data) {
        setAdmins(data);
        setFiltered(data);
      }
    };
    fetchAdmins();
  }, [triggerFetchAdmin]);
  useEffect(() => {
    if (!search) return;
    const currAdmins = admins.filter(
      admin =>
        admin.name.toLowerCase().includes(search) || admin.email.toLowerCase().includes(search)
    );
    setFiltered(currAdmins);
  }, [search, admins]);

  return (
    <section className="lg:col-span-6 relative">
      <Card>
        <DashboardSectionHeader
          title="Admin Management"
          subtitle="Invite admins, set roles, remove access (UI-only)."
        />

        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Admin (name,email)"
            className="w-full min-w-0"
            value={search}
            setValue={setSearch}
          />
        </div>

        <div className="mt-5 overflow-hidden overflow-y-auto rounded-2xl border border-white/10 max-h-[450px]">
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
              {filtered.map(admin => (
                <tr key={admin.name} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-medium">{admin.name}</div>
                    <div className="text-xs text-white/50">{admin.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={"neutral"}>{"Admin"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={admin.deleted ? "bad" : "good"}>
                      {admin.deleted ? "Inactive" : "active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <DashboardButton variant="error" onClick={() => removeAdmin(admin.id)}>
                        Remove
                      </DashboardButton>
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
