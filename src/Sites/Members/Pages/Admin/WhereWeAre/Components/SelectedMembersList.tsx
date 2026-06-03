import { IoChevronDown, IoChevronUp, IoClose } from "react-icons/io5";

import { normalizeExternalHref } from "src/Utils/functions";
import { mostRecentExperienceLine, type WhereWeAreMemberFields } from "src/Utils/whereWeAre";

type Props = {
  members: WhereWeAreMemberFields[];
  onRemove: (id: number) => void;
  onMove: (id: number, direction: -1 | 1) => void;
};

export default function SelectedMembersList({ members, onRemove, onMove }: Props) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-(--obs-text-muted)">
        No members selected. Search above to add people — order here is display order on the main
        site.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {members.map((member, index) => {
        const photo = normalizeExternalHref(member.profile_picture);
        const experience = mostRecentExperienceLine(member.experiences);

        return (
          <li
            key={member.id}
            className="flex items-center gap-3 rounded-xl border border-(--obs-border) bg-(--obs-surface-raised) p-3"
          >
            <span className="w-6 shrink-0 text-center font-mono text-xs text-(--obs-text-faint)">
              {index + 1}
            </span>
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-(--obs-border)">
              {photo ? (
                <img src={photo} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-[0.65rem] text-(--obs-text-faint)">
                  —
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate font-medium text-(--obs-text-primary)">
                {member.full_name?.trim() || "Member"}
              </p>
              {experience ? (
                <p className="m-0 truncate text-sm text-(--obs-text-muted)">{experience}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="btn btn-ghost btn-square btn-sm"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => onMove(member.id, -1)}
              >
                <IoChevronUp size={18} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-square btn-sm"
                aria-label="Move down"
                disabled={index === members.length - 1}
                onClick={() => onMove(member.id, 1)}
              >
                <IoChevronDown size={18} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-square btn-sm text-red-400 hover:text-red-300"
                aria-label="Remove"
                onClick={() => onRemove(member.id)}
              >
                <IoClose size={20} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
