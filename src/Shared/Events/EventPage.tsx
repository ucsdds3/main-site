import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import Page from "src/Shared/Page/Page";
import { EventTagType, tagColor } from "src/Utils/types";
import { twMerge } from "src/Utils/cn";

import useEvents from "./useEvents";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

type TimeType = "Past" | "Upcoming" | "All";
type ViewType = "Cards" | "Calendar";

export default function EventPage({ defaultTime = "Upcoming" }: { defaultTime?: TimeType }) {
  const [tag, setTag] = useState<EventTagType | "All">("All");
  const [time, setTime] = useState<TimeType>(defaultTime);
  const [ascending, setAscending] = useState<boolean>(true);
  const [view, setView] = useState<ViewType>("Cards");

  const { events, loading, error } = useEvents();

  const titleTag = tag === "All" ? "Events" : `${tag} Events`;
  const titleTime = time === "All" ? "All" : time;

  const calendarEvents = useMemo(() => {
    const tagEvents = tag === "All" ? events : events.filter(e => e.tags?.includes(tag));
    const withoutSuperbowl = tagEvents.filter(
      event => (event.name ?? "").trim().toLowerCase() !== "superbowl"
    );
    return [...withoutSuperbowl].sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime());
  }, [events, tag]);

  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[1300px] flex-col fl-gap-8/12 fl-px-5/12 fl-py-10/20">
        {/* Header */}
        <div className="obs-section-header-border">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="obs-eyebrow-row"
          >
            <div className="obs-accent-bar-orange" />
            <span className="text-eyebrow text-eyebrow-orange">On the calendar</span>
          </motion.div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <motion.h1
              key={`${time}-${tag}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-fluid-page-hero"
            >
              {titleTime} {titleTag}
            </motion.h1>

            {/* Filter controls */}
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-[0.3rem]">
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-40">
                  View
                </span>
                <div className="inline-flex overflow-hidden rounded-full border border-(--obs-border) bg-transparent">
                  {(["Cards", "Calendar"] as const).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={twMerge(
                        "cursor-pointer border-0 px-[0.9rem] py-[0.45rem] font-mono text-[0.68rem] uppercase tracking-[0.12em] text-(--obs-text-primary) transition-[background,opacity] duration-150",
                        view === v ? "bg-[rgba(245,129,52,0.14)] opacity-100" : "bg-transparent opacity-55"
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {(
                view === "Calendar"
                  ? ([
                      {
                        label: "Tag",
                        value: tag,
                        options: ["All", ...Object.keys(tagColor)],
                        onChange: (v: string) => setTag(v as EventTagType | "All"),
                      },
                    ] as const)
                  : ([
                      {
                        label: "When",
                        value: time,
                        options: ["Past", "Upcoming", "All"],
                        onChange: (v: string) => setTime(v as TimeType),
                      },
                      {
                        label: "Tag",
                        value: tag,
                        options: ["All", ...Object.keys(tagColor)],
                        onChange: (v: string) => setTag(v as EventTagType | "All"),
                      },
                      {
                        label: "Sort",
                        value: ascending ? "Ascending" : "Descending",
                        options: ["Ascending", "Descending"],
                        onChange: (v: string) => setAscending(v === "Ascending"),
                      },
                    ] as const)
              ).map(({ label, value, options, onChange }) => (
                <div key={label} className="flex flex-col gap-[0.3rem]">
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-40">
                    {label}
                  </span>
                  <select
                    value={value}
                    className="obs-select text-(--obs-text-primary)"
                    onChange={e => onChange(e.target.value)}
                  >
                    {options.map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event list */}
        {view === "Calendar" ? (
          <>
            {error ? (
              <div className="obs-empty-state-center">
                <div className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-(--obs-text-primary) opacity-60">
                  {error}
                </div>
              </div>
            ) : loading ? (
              <div className="obs-empty-state-center">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-(--obs-text-primary) opacity-60">
                  Loading…
                </span>
              </div>
            ) : (
              <EventCalendar events={calendarEvents} />
            )}
          </>
        ) : (
          <EventList tag={tag} time={time} ascending={ascending} />
        )}
      </div>
    </Page>
  );
}
