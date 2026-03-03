import { useState } from "react";
import { motion } from "framer-motion";

import Page from "src/Shared/Page/Page";
import { EventTagType, tagColor } from "src/Utils/types";

import EventList from "./EventList";

type TimeType = "Past" | "Upcoming" | "All";

const selectStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
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
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23F58134' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.6rem center",
  minWidth: "9rem",
};

export default function EventPage({ defaultTime = "Upcoming" }: { defaultTime?: TimeType }) {
  const [tag, setTag] = useState<EventTagType | "All">("All");
  const [time, setTime] = useState<TimeType>(defaultTime);
  const [ascending, setAscending] = useState<boolean>(true);

  const titleTag = tag === "All" ? "Events" : `${tag} Events`;
  const titleTime = time === "All" ? "All" : time;

  return (
    <Page>
      <div
        style={{
          width: "100%",
          maxWidth: 1300,
          margin: "0 auto",
          padding: "clamp(4rem, 7vw, 7rem) clamp(1.25rem, 4vw, 3rem) clamp(2.5rem, 5vw, 5rem)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(2rem, 4vw, 3rem)",
        }}
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
            <span style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#F58134",
            }}>
              On the calendar
            </span>
          </motion.div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <motion.h1
              key={`${time}-${tag}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
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
              {([
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
              ] as const).map(({ label, value, options, onChange }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <span style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: "0.55rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--obs-text-primary)",
                    opacity: 0.4,
                  }}>
                    {label}
                  </span>
                  <select
                    value={value}
                    style={selectStyle}
                    onChange={e => onChange(e.target.value)}
                  >
                    {options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event list */}
        <EventList tag={tag} time={time} ascending={ascending} />
      </div>
    </Page>
  );
}