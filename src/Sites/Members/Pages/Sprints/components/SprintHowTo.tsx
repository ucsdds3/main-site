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
            visibility is how we keep work accountable: a task has owners, a director as reviewer,
            and a public status.
          </p>
        </section>
        <section>
          <h3 className="mt-0 mb-1 text-sm text-(--obs-text-primary)">How to cut work</h3>
          <p className="m-0">
            Each card should be one tangible unit of work: shippable or reviewable on its own. Not a
            one-line chore, and not a whole committee’s quarter.{" "}
            <strong className="text-(--obs-text-primary)">No task should be above 5 hours.</strong>{" "}
            If it is, split it. Log expected hours up front; log actual hours before pending review.
          </p>
        </section>
        <section>
          <h3 className="mt-0 mb-1 text-sm text-(--obs-text-primary)">
            How to move through the board
          </h3>
          <ul className="m-0 list-disc space-y-1 pl-5">
            <li>
              <span className="text-(--obs-text-primary)">To do</span> — new work. Drag or open the
              card to change status.
            </li>
            <li>
              <span className="text-(--obs-text-primary)">In progress</span> — someone is actively
              on it.
            </li>
            <li>
              <span className="text-(--obs-text-primary)">Pending review</span> — assignees are
              done. Actual hours required. The reviewer then approves (optional comment).
            </li>
            <li>
              <span className="text-(--obs-text-primary)">Complete</span> — only after that
              approval.
            </li>
          </ul>
          <p className="mb-0 mt-2">
            Filter by team tabs or search a person. Check every sprint a long-running task belongs
            to so leftover work can ride into the next sprint without duplicating the card.
          </p>
        </section>
      </div>
    </details>
  );
}
