import { formatUsd, type FundraiserRow } from "../Utils/fundraising";

type FundraisingMeterProps = {
  goalAmount: number;
  fundraisers: FundraiserRow[];
  raised: number;
};

export default function FundraisingMeter({
  goalAmount,
  fundraisers,
  raised,
}: FundraisingMeterProps) {
  const pct = goalAmount > 0 ? Math.min(100, (raised / goalAmount) * 100) : 0;
  const over = raised > goalAmount && goalAmount > 0;

  return (
    <div className="obs-panel p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 font-mono text-[0.68rem] uppercase tracking-widest text-(--obs-text-faint)">
            Raised
          </p>
          <p className="mb-0 mt-1 text-3xl font-semibold text-[#F58134]">{formatUsd(raised)}</p>
        </div>
        <p className="m-0 text-sm text-(--obs-text-muted)">
          of {formatUsd(goalAmount)}
          {over ? " · over goal" : ` · ${Math.round(pct)}%`}
        </p>
      </div>

      <div
        className="mt-5 h-8 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goalAmount}
        aria-valuenow={Math.min(raised, goalAmount)}
      >
        <div className="flex h-full" style={{ width: `${pct}%` }}>
          {fundraisers.map(row => (
            <div
              key={row.id}
              title={`${row.place}: ${formatUsd(row.amount)}`}
              className="h-full min-w-0"
              style={{ flexGrow: row.amount, background: row.color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
