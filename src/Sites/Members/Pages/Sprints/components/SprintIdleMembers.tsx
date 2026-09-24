import { labelToTeamKey } from "src/Sites/Main/Pages/Board/boardTeamConfig";

import { isOpenSprintTaskStatus, teamLabel } from "../constants";
import type { BoardAssigneeOption, SprintTaskRow } from "../types";

type SprintIdleMembersProps = {
  members: BoardAssigneeOption[];
  tasks: SprintTaskRow[];
  teamTab: string;
};

function memberTeamKeys(member: BoardAssigneeOption): string[] {
  return Object.keys(member.teams ?? {}).map(labelToTeamKey);
}

export default function SprintIdleMembers({ members, tasks, teamTab }: SprintIdleMembersProps) {
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
            <p className="mt-0 mb-3 text-sm leading-6 text-[#fca5a5]">
              Board members with a committee who are not assigned to any to-do, in-progress, or
              pending-review card this sprint. People without a team are omitted. Completed or
              dropped work does not count.
            </p>
            <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {idle.map(member => {
                const teams = memberTeamKeys(member);
                return (
                  <li
                    key={member.id}
                    className="rounded-xl border border-[rgba(248,113,113,0.28)] bg-[rgba(8,14,25,0.55)] px-3 py-2.5"
                  >
                    <p className="m-0 text-sm text-(--obs-text-primary)">{member.full_name}</p>
                    <p className="mb-0 mt-1 font-mono text-[0.62rem] uppercase tracking-widest text-[#f87171]">
                      {teams.map(key => teamLabel(key)).join(" · ")}
                    </p>
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
