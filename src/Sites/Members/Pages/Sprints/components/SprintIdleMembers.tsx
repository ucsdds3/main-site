import { useState } from "react";
import toast from "react-hot-toast";

import { labelToTeamKey } from "src/Sites/Main/Pages/Board/boardTeamConfig";

import { isOpenSprintTaskStatus, teamLabel } from "../constants";
import { nudgeIdleMembers } from "../hooks/useSprintBoard";
import type { BoardAssigneeOption, SprintTaskRow } from "../types";

type SprintIdleMembersProps = {
  members: BoardAssigneeOption[];
  tasks: SprintTaskRow[];
  teamTab: string;
  sprintId: number;
  canNudge?: boolean;
};

function memberTeamKeys(member: BoardAssigneeOption): string[] {
  return Object.keys(member.teams ?? {}).map(labelToTeamKey);
}

function NudgeButton({
  label,
  busy,
  disabled,
  onClick,
}: {
  label: string;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="cursor-pointer rounded-full border border-[rgba(248,113,113,0.45)] bg-[rgba(248,113,113,0.12)] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-widest text-[#fca5a5] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? "Sending…" : label}
    </button>
  );
}

export default function SprintIdleMembers({
  members,
  tasks,
  teamTab,
  sprintId,
  canNudge = true,
}: SprintIdleMembersProps) {
  const [nudging, setNudging] = useState<number | "all" | null>(null);

  const busyIds = new Set<number>();
  for (const task of tasks) {
    if (!isOpenSprintTaskStatus(task.status)) continue;
    for (const assignee of task.assignees) busyIds.add(assignee.id);
  }

  const idle = members
    .filter(member => {
      const keys = memberTeamKeys(member);
      if (keys.length === 0) return false;
      if (busyIds.has(member.id)) return false;
      if (teamTab !== "ALL" && !keys.includes(teamTab)) return false;
      return true;
    })
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const sendNudge = async (targets: BoardAssigneeOption[], mode: number | "all") => {
    if (targets.length === 0) return;
    setNudging(mode);
    try {
      const emailed = await nudgeIdleMembers(
        sprintId,
        targets.map(m => m.id)
      );
      toast.success(
        emailed === 1 ? `Nudged ${targets[0].full_name}.` : `Nudged ${emailed} people.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send nudge");
    } finally {
      setNudging(null);
    }
  };

  return (
    <details className="rounded-2xl border border-[rgba(248,113,113,0.45)] bg-[rgba(127,29,29,0.18)] px-5 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-mono text-[0.72rem] uppercase tracking-widest text-[#f87171] [&::-webkit-details-marker]:hidden">
        <span>Individuals with no tasks this sprint</span>
        <span className="rounded-full border border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.12)] px-2.5 py-0.5 tabular-nums">
          {idle.length}
        </span>
      </summary>
      <div className="mt-4">
        {idle.length === 0 ? (
          <p className="m-0 text-sm text-(--obs-text-muted)">
            Every board member with an assigned team has at least one to-do, in-progress, or
            pending-review task
            {teamTab === "ALL" ? "" : ` on ${teamLabel(teamTab)}`}.
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <p className="m-0 flex-1 text-sm leading-6 text-[#fca5a5]">
                Board members with a committee who are not assigned to any to-do, in-progress, or
                pending-review card this sprint. People without a team are omitted. Completed or
                dropped work does not count.
              </p>
              {canNudge ? (
                <NudgeButton
                  label="Nudge all"
                  busy={nudging === "all"}
                  disabled={nudging != null}
                  onClick={() => void sendNudge(idle, "all")}
                />
              ) : null}
            </div>
            <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {idle.map(member => {
                const teams = memberTeamKeys(member);
                return (
                  <li
                    key={member.id}
                    className="rounded-xl border border-[rgba(248,113,113,0.28)] bg-[rgba(8,14,25,0.55)] px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="m-0 text-sm text-(--obs-text-primary)">{member.full_name}</p>
                        <p className="mb-0 mt-1 font-mono text-[0.62rem] uppercase tracking-widest text-[#f87171]">
                          {teams.map(key => teamLabel(key)).join(" · ")}
                        </p>
                      </div>
                      {canNudge ? (
                        <NudgeButton
                          label="Nudge"
                          busy={nudging === member.id}
                          disabled={nudging != null}
                          onClick={() => void sendNudge([member], member.id)}
                        />
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </details>
  );
}
