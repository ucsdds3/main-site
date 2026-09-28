import { twMerge } from "src/Utils/cn";

type HowToProps = {
  className?: string;
};

export default function SprintHowTo({ className }: HowToProps) {
  return (
    <details
      className={twMerge(
        "rounded-2xl border border-(--obs-border) bg-(--obs-surface) px-5 py-4",
        className
      )}
    >
      <summary className="cursor-pointer font-mono text-[0.72rem] uppercase tracking-widest text-[#19B5CA]">
        How to use the sprint board
      </summary>
      <div className="mt-4 flex max-w-4xl flex-col gap-4 text-sm leading-6 text-(--obs-text-muted)">
        <section>
          <h3 className="mt-0 mb-1 text-sm text-(--obs-text-primary)">What this is</h3>
          <p className="m-0">
            A club-wide kanban for the current sprint. In DS3 it exists so every committee can see
            what the rest of the board owns — not just their own Discord channel. That cross-board
            visibility is how we keep work accountable: a task has owners, an optional reviewer
            (usually a director), and a public status.
          </p>
        </section>
        <section>
          <h3 className="mt-0 mb-1 text-sm text-(--obs-text-primary)">How to cut work</h3>
          <p className="m-0">
            Each card should be one tangible unit of work: shippable or reviewable on its own. Not a
            one-line chore, and not a whole committee’s quarter.{" "}
            <strong className="text-(--obs-text-primary)">No task should be above 5 hours.</strong>{" "}
            If it is, split it. Log expected hours up front; log actual hours before pending review
            or complete. You can assign specific people to one card, or everyone on a team — that
            creates a separate card for each person.
          </p>
        </section>
        <section>
          <h3 className="mt-0 mb-1 text-sm text-(--obs-text-primary)">
            How to move through the board
          </h3>
          <ul className="m-0 list-disc space-y-1 pl-5">
            <li>
              <span className="text-(--obs-text-primary)">To do</span> — new work. Drag a card to
              change status. Cards show title and assignee; open Details for hours, due date,
              assigner, and reviewer. Use Edit to change or delete.
            </li>
            <li>
              <span className="text-(--obs-text-primary)">In progress</span> — someone is actively
              on it.
            </li>
            <li>
              <span className="text-(--obs-text-primary)">Pending review</span> — assignees are done
              and a reviewer is assigned. Actual hours required. The reviewer then approves
              (optional comment). Skip this column when there is no reviewer.
            </li>
            <li>
              <span className="text-(--obs-text-primary)">Complete</span> — after reviewer approval,
              or straight from In progress if the task has no reviewer (actual hours still
              required).
            </li>
          </ul>
          <p className="mb-0 mt-2">
            Filter starts on your tasks, or pick a team tab / search a person. All time loads that
            person’s cards across every sprint — search someone first so the board stays fast. Check
            every sprint a long-running task belongs to so leftover work can ride into the next
            sprint without duplicating the card. Overdue cards can be nudged so assignees get an
            email.
          </p>
        </section>
      </div>
    </details>
  );
}
