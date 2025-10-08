import { memo } from "react";

type AttendedEvent = {
  id?: string | number;
  name: string;
  description?: string | null;
  points?: number | null;
};

const AttendedCard = memo(function AttendedCard({
  name,
  description,
  points = 0,
}: AttendedEvent) {
  return (
    <div
      className="w-full max-w-[800px] rounded-2xl bg-base-400 border border-[var(--initial-border-color)]
                 hover:border-[var(--border-color)] duration-150 px-6 py-5
                 flex flex-col gap-2"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-2xl font-bold capitalize">{name}</h4>
        <div className="shrink-0 text-sm bg-[var(--color-base-100)] px-2 py-0.5 rounded-lg border border-[var(--color-base-200)]">
          {points ?? 0} point(s)
        </div>
      </div>

      {/* Description */}
      {description ? (
        <p className="text-[var(--card-textcolor)] text-base md:text-lg font-light line-clamp-3">
          {description}
        </p>
      ) : (
        <div className="w-full">
          <div className="h-4 my-1 w-3/4 skeleton" />
          <div className="h-4 my-1 w-2/3 skeleton" />
          <div className="h-4 my-1 w-1/2 skeleton" />
        </div>
      )}
    </div>
  );
});

export default AttendedCard;
