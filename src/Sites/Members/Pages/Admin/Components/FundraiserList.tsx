import { formatFundraiserDate, formatUsd, type FundraiserRow } from "../Utils/fundraising";

type FundraiserListProps = {
  fundraisers: FundraiserRow[];
  canEdit: boolean;
  onDelete: (id: number) => void;
};

export default function FundraiserList({ fundraisers, canEdit, onDelete }: FundraiserListProps) {
  if (fundraisers.length === 0) {
    return (
      <p className="m-0 rounded-2xl border border-dashed border-(--obs-border) px-4 py-10 text-center text-sm text-(--obs-text-muted)">
        No fundraisers logged for this quarter yet.
      </p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {fundraisers.map(row => (
        <li
          key={row.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--obs-border) bg-(--obs-surface) px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: row.color, boxShadow: `0 0 10px ${row.color}` }}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="m-0 truncate font-medium text-(--obs-text-primary)">{row.place}</p>
              <p className="mb-0 mt-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-(--obs-text-faint)">
                {formatFundraiserDate(row.held_on)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="m-0 tabular-nums text-sm text-(--obs-text-primary)">
              {formatUsd(row.amount)}
            </p>
            {canEdit ? (
              <button
                type="button"
                onClick={() => onDelete(row.id)}
                className="cursor-pointer border-0 bg-transparent font-mono text-[0.62rem] uppercase tracking-widest text-[#f87171]"
              >
                Remove
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
