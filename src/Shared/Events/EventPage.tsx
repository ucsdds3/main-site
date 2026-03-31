import { useMemo, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";

import Page from "src/Shared/Page/Page";
import { EventTagType, tagColor } from "src/Utils/types";

import { ORANGE_SELECT_CHEVRON_DATA_URL } from "src/Shared/icons/orangeSelectChevronDataUrl";

import useEvents from "./useEvents";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

type TimeType = "Past" | "Upcoming" | "All";
type ViewType = "Cards" | "Calendar";

const selectStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.68rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  background: "transparent",
  border: "1px solid var(--obs-border, rgba(128,128,128,0.25))",
  borderRadius: "0.375rem",
  padding: "0.45rem 2rem 0.45rem 0.75rem",
  color: "var(--obs-text-primary)",
  cursor: "pointer",
  appearance: "none" as const,
  WebkitAppearance: "none" as const,
  backgroundImage: ORANGE_SELECT_CHEVRON_DATA_URL,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.6rem center",
  minWidth: "9rem",
};

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
      <div
        className="mx-auto flex w-full max-w-[1300px] flex-col fl-gap-8/12 fl-px-5/12 fl-py-10/20"
      >
        {/* Header */}
        <div style={{ borderBottom: "1px solid var(--obs-border, rgba(128,128,128,0.2))", paddingBottom: "clamp(1.5rem, 3vw, 2.5rem)" }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}
          >
            <div style={{ width: 22, height: 2, background: "#F58134", borderRadius: 2 }} />
            <span className="text-eyebrow text-eyebrow-orange">On the calendar</span>
          </motion.div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <motion.h1
              key={`${time}-${tag}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                fontWeight: 400,
                lineHeight: 0.95,
                color: "var(--obs-text-primary)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {titleTime} {titleTag}
            </motion.h1>

            {/* Filter controls */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-40">
                  View
                </span>
                <div style={{
                  display: "inline-flex",
                  borderRadius: "9999px",
                  border: "1px solid var(--obs-border, rgba(128,128,128,0.25))",
                  overflow: "hidden",
                  background: "transparent",
                }}>
                  {(["Cards", "Calendar"] as const).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.68rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        padding: "0.45rem 0.9rem",
                        border: "none",
                        cursor: "pointer",
                        background: view === v ? "rgba(245,129,52,0.14)" : "transparent",
                        color: view === v ? "var(--obs-text-primary)" : "var(--obs-text-primary)",
                        opacity: view === v ? 1 : 0.55,
                        transition: "background 0.15s ease, opacity 0.15s ease",
                      }}
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
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-(--obs-text-primary) opacity-40">
                    {label}
                  </span>
                  <select
                    value={value}
                    className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-(--obs-text-primary)"
                    style={selectStyle}
                    onChange={e => onChange(e.target.value)}
                  >
                    {options.map((opt: string) => (
                      <option
                        key={opt}
                        value={opt}
                        style={{
                          backgroundColor: "#020815",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
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
              <div style={{ display: "flex", justifyContent: "center", padding: "3rem 1rem" }}>
                <div className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-(--obs-text-primary) opacity-60">
                  {error}
                </div>
              </div>
            ) : loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "3rem 1rem" }}>
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