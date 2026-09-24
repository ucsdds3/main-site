import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Page from "src/Shared/Page/Page";
import { useSiteHandler } from "src/Hooks/useSiteHandler";

import CreateSprintDialog from "./components/CreateSprintDialog";
import SprintSwitcher from "./components/SprintSwitcher";
import { useCurrentMember } from "./hooks/useCurrentMember";
import { useSprints } from "./hooks/useSprints";
import SprintBoard from "./SprintBoard";
import type { SprintRow } from "./types";

export default function Sprints() {
  const { sprintId } = useParams();
  const { navigate } = useSiteHandler();
  const { member, loading: memberLoading } = useCurrentMember();
  const { activeSprint, planningSprint, sprints, loading, reload, createSprint, updateSprint } =
    useSprints();
  const [createOpen, setCreateOpen] = useState(false);

  const selected = useMemo(() => {
    if (sprintId) {
      const id = Number(sprintId);
      return sprints.find(s => s.id === id) ?? null;
    }
    return activeSprint;
  }, [sprintId, sprints, activeSprint]);

  const isExec = member?.admin_level === "Executive";

  const openSprint = (sprint: SprintRow) => {
    if (activeSprint && sprint.id === activeSprint.id) {
      navigate({ pathname: "/sprints" });
      return;
    }
    navigate({ pathname: `/sprints/${sprint.id}` });
  };

  return (
    <Page>
      <div className="mx-auto flex w-full flex-col gap-8 px-5 py-10 md:px-8 lg:px-10">
        {memberLoading || loading ? (
          <p className="text-(--obs-text-muted)">Loading sprints…</p>
        ) : !member ? (
          <p className="text-(--obs-text-muted)">Could not load your board profile.</p>
        ) : (
          <>
            <SprintSwitcher
              sprints={sprints}
              selectedId={selected?.id ?? null}
              onSelect={openSprint}
              onCreate={isExec ? () => setCreateOpen(true) : undefined}
            />

            {selected ? (
              <SprintBoard
                sprint={selected}
                planningSprint={planningSprint}
                sprints={sprints}
                member={member}
                createSprint={createSprint}
                updateSprint={updateSprint}
                onSprintsChanged={reload}
              />
            ) : (
              <div>
                <div className="obs-eyebrow-row">
                  <div className="obs-accent-bar-cyan" />
                  <span className="text-eyebrow text-eyebrow-cyan">Sprints</span>
                </div>
                <h1 className="mt-3 mb-3 text-fluid-page-hero">No active sprint</h1>
                <p className="mt-0 max-w-xl text-sm leading-6 text-(--obs-text-muted)">
                  {sprints.length > 0
                    ? "Pick an upcoming or past sprint above, or ask an Executive to open the next one."
                    : isExec
                      ? "Create a club-wide sprint so every committee can post work and see what others own."
                      : "An Executive needs to open the next sprint before tasks can be added."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {createOpen && member ? (
        <CreateSprintDialog
          onClose={() => setCreateOpen(false)}
          onCreate={async input => {
            const created = await createSprint({ ...input, created_by: member.id });
            toast.success("Sprint created.");
            await reload();
            if (created.status !== "active") {
              navigate({ pathname: `/sprints/${created.id}` });
            }
          }}
        />
      ) : null}
    </Page>
  );
}
