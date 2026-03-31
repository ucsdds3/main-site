import { useRef } from "react";
import { useInView } from "framer-motion";

import { unbreakable } from "src/Utils/functions.tsx";

const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { title: "DataHacks Registrants", value: 1000, color: "#F58134" },
    { title: "Workshops Hosted",       value: 100, color: "#19B5CA" },
    { title: "Active Members",         value: 600, color: "#a78bfa" },
    { title: "Projects Completed",     value: 50,  color: "var(--obs-text-primary)" },
  ];

  return (
    <div
        ref={ref}
        className="grid grid-cols-2 lg:grid-cols-4 w-full max-w-5xl"
        style={{
          borderTop: "1px solid var(--obs-border)",
          borderBottom: "1px solid var(--obs-border)",
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className={index > 0 ? "stat-divider" : ""}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem 1.5rem",
              gap: "0.5rem",
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.8rem, 4vw, 4rem)",
                fontWeight: 400,
                color: stat.color,
                lineHeight: 1,
              }}
              className={isInView ? `stats-${stat.value}` : ""}
            />

            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.6rem, 0.8vw, 0.7rem)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--obs-text-faint)",
                textAlign: "center",
              }}
            >
              {unbreakable(stat.title)}
            </span>
          </div>
        ))}
      </div>
  );
};

export default Stats;