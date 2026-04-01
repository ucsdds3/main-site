import type { CSSProperties } from "react";
import { useRef } from "react";
import { useInView } from "framer-motion";

import { unbreakable } from "src/Utils/functions.tsx";

const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { title: "DataHacks Registrants", value: 1000, color: "#F58134" },
    { title: "Workshops Hosted", value: 100, color: "#19B5CA" },
    { title: "Active Members", value: 600, color: "#a78bfa" },
    { title: "Projects Completed", value: 50, color: "var(--obs-text-primary)" },
  ];

  return (
    <div
      ref={ref}
      className="grid w-full max-w-5xl grid-cols-2 border-y border-(--obs-border) lg:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`relative flex flex-col items-center justify-center gap-2 px-6 py-8 ${
            index > 0 ? "max-lg:border-t max-lg:border-(--obs-border) lg:border-l lg:border-(--obs-border)" : ""
          }`}
        >
          <span
            className={isInView ? `stats-${stat.value} font-heading text-[clamp(2.8rem,4vw,4rem)] font-normal leading-none` : "font-heading text-[clamp(2.8rem,4vw,4rem)] font-normal leading-none"}
            style={{ color: stat.color } satisfies CSSProperties}
          />

          <span className="text-center font-mono text-[clamp(0.6rem,0.8vw,0.7rem)] uppercase tracking-[0.18em] text-(--obs-text-faint)">
            {unbreakable(stat.title)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Stats;
