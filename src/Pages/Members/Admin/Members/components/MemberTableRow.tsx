import { PortalMemberType } from "../../../../../Utils/types";
import { getTier } from "../utils";

interface MemberTableRowProps {
  member: PortalMemberType;
  onSelect: (member: PortalMemberType) => void;
}

export default function MemberTableRow({ member, onSelect }: MemberTableRowProps) {
  return (
    <tr
      className="hover:bg-white/5 cursor-pointer"
      onClick={() => {
        console.log(member);
        onSelect(member);
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
      <td className="px-4 py-3">{member.experience}</td>
      <td className="px-4 py-3">{(member as any).major || "-"}</td>
      <td className="px-4 py-3">{(member as any).graduation_year || "-"}</td>
    </tr>
  );
}
