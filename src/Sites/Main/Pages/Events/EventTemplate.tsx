import { motion } from "framer-motion";

import Page from "src/Shared/Page/Page";
import { EventTagType, TeamType } from "src/Utils/types";

import About from "../../Components/About";
import Landing from "./Sections/Landing";
import EventList from "src/Shared/Events/EventList";

export default function EventTemplate({ team }: { team: TeamType }) {
  if (!team.title || !team.subtitle) {
    console.error("Missing team title or subtitle");
    return null;
  }

  const teamEventTagMap: Record<string, EventTagType | ""> = {
    Workshops:            "Workshop",
    "Social Events":      "Social",
    "Professional Events":"Professional",
  };

  return (
    <Page>
      <Landing
        title={team.title.toUpperCase()}
        subtitle={team.subtitle}
        headerImg={team.headerImg}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 1300,
          margin: "0 auto",
          padding: "clamp(2.5rem, 5vw, 5rem) clamp(1.25rem, 4vw, 3rem)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(3rem, 5vw, 5rem)",
        }}
      >
        <About {...team} />

        {/* Section header */}
        {team.title !== "Upcoming Events" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 28, height: 2, background: "#F58134", borderRadius: 2, flexShrink: 0 }} />
              <span style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#F58134",
              }}>
                On the calendar
              </span>
            </div>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
              fontWeight: 400,
              color: "var(--obs-text-primary)",
              margin: 0,
            }}>
              Upcoming {team.title}
            </h2>
          </motion.div>
        )}

        <EventList tag={teamEventTagMap[team.title as keyof typeof teamEventTagMap] || "All"} />
      </div>
    </Page>
  );
}