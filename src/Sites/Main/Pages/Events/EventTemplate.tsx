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

      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-[clamp(3rem,5vw,5rem)] px-[clamp(1.25rem,4vw,3rem)] py-[clamp(2.5rem,5vw,5rem)]">
        <About {...team} />

        {/* Section header + calendar list — not shown on GBM or LeetCode Sessions */}
        {team.title !== "GBM" && team.title !== "LeetCode Sessions" && team.title !== "Upcoming Events" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-7 shrink-0 rounded-sm bg-[#F58134]" />
              <span className="text-eyebrow text-eyebrow-orange">On the calendar</span>
            </div>
            <h2 className="text-fluid-subsection-title m-0 text-(--obs-text-primary)">
              Upcoming {team.title}
            </h2>
          </motion.div>
        )}

        {team.title !== "GBM" && team.title !== "LeetCode Sessions" && (
          <EventList tag={teamEventTagMap[team.title as keyof typeof teamEventTagMap] || "All"} />
        )}
      </div>
    </Page>
  );
}